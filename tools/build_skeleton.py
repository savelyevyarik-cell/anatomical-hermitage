"""
Генератор модели человеческого скелета для сайта «Анатомический эрмитаж».

Запуск (Blender 4.x / 5.x):
    blender --background --python tools/build_skeleton.py

Результат: public/models/skeleton.glb

Почему скриптом, а не ручным моделированием: анатомия здесь описывается
параметрами (обхват клетки по парам рёбер, наклон рёбер, пропорции таза),
поэтому правки вносятся числом, а не переклеиванием вершин. Модель
воспроизводима и версионируется вместе с кодом.

Приёмы, за счёт которых кость перестаёт быть «трубками»:
  * рёбра и лопатки строятся по профилю-эллипсу (bevel_object), а не
    круглым сечением — настоящее ребро плоское;
  * глазницы, носовое отверстие, запирательные отверстия таза и
    подвздошная ямка вырезаются булевой разностью, а не имитируются;
  * позвонок собирается из тела, дуги, поперечных и остистого отростков.
"""

import math
import os
import sys

import bpy

# --- общие параметры ------------------------------------------------------

PAIRS = 12                 # пар рёбер
SPINE_Y = -0.50            # позвоночник смещён назад (Blender: +Y = вперёд)
STERNUM_Y = 0.46           # грудина спереди
BONE_NAME = 'Bone'

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'public', 'models', 'skeleton.glb')

_scratch = []              # временные объекты: профили и резаки


# --- утилиты --------------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.objects):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def bone_material():
    mat = bpy.data.materials.get(BONE_NAME)
    if mat:
        return mat
    mat = bpy.data.materials.new(BONE_NAME)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    # Матовая сухая кость: никакого «мокрого» блеска
    bsdf.inputs['Base Color'].default_value = (0.87, 0.84, 0.77, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.74
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = 0.0
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.22
    return mat


def finish(obj):
    obj.data.materials.clear()
    obj.data.materials.append(bone_material())
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def activate(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def make_profile(name, rx, ry):
    """Эллиптический профиль сечения — для плоских костей."""
    bpy.ops.curve.primitive_bezier_circle_add(radius=1.0, location=(0, 0, 0))
    prof = bpy.context.active_object
    prof.name = name
    prof.scale = (rx, ry, 1.0)
    activate(prof)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    _scratch.append(prof)
    return prof


def tube(points, name, radius=0.03, profile=None, taper=None, caps=True):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 3
    curve.use_fill_caps = caps
    if profile is not None:
        curve.bevel_mode = 'OBJECT'
        curve.bevel_object = profile
    else:
        curve.bevel_depth = radius
        curve.bevel_resolution = 3

    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for i, p in enumerate(points):
        spline.points[i].co = (p[0], p[1], p[2], 1.0)
        spline.points[i].radius = 1.0 if taper is None else taper(i / max(len(points) - 1, 1))

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    activate(obj)
    bpy.ops.object.convert(target='MESH')
    return finish(bpy.context.active_object)


def prim(kind, name, location=(0, 0, 0), scale=(1, 1, 1), rotation=(0, 0, 0), **kw):
    if kind == 'sphere':
        bpy.ops.mesh.primitive_uv_sphere_add(segments=kw.get('segments', 20),
                                             ring_count=kw.get('rings', 12),
                                             radius=1.0, location=location)
    elif kind == 'cylinder':
        bpy.ops.mesh.primitive_cylinder_add(vertices=kw.get('verts', 14),
                                            radius=1.0, depth=1.0, location=location)
    elif kind == 'cone':
        bpy.ops.mesh.primitive_cone_add(vertices=kw.get('verts', 14), radius1=1.0,
                                        radius2=kw.get('r2', 0.0), depth=1.0,
                                        location=location)
    elif kind == 'cube':
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rotation
    activate(obj)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return finish(bpy.context.active_object)


def cutter(kind, **kw):
    """Объект-резак: не попадает в финальную геометрию."""
    obj = prim(kind, 'Cutter', **kw)
    _scratch.append(obj)
    return obj


def carve(target, cutters, operation='DIFFERENCE'):
    for cut in cutters:
        activate(target)
        mod = target.modifiers.new('bool', 'BOOLEAN')
        mod.object = cut
        mod.operation = operation
        mod.solver = 'EXACT'
        bpy.ops.object.modifier_apply(modifier=mod.name)
        if cut in _scratch:
            _scratch.remove(cut)
        bpy.data.objects.remove(cut, do_unlink=True)
    return finish(target)


def merge(objs, name):
    objs = [o for o in objs if o is not None]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = name
    return obj


# --- позвоночник ----------------------------------------------------------

def vertebra(z, y, size, kind, index):
    """Позвонок: тело, дуга, поперечные отростки, остистый отросток."""
    r = size
    parts = [
        # Тело — почкообразное: шире, чем глубже
        prim('cylinder', f'Body_{index}', location=(0, y, z),
             scale=(r, r * 0.82, 0.058), verts=16),
        # Дуга позвонка сзади тела
        prim('cylinder', f'Arch_{index}', location=(0, y - r * 0.95, z),
             scale=(r * 0.62, r * 0.5, 0.05), verts=12),
    ]
    # Поперечные отростки
    for side in (1, -1):
        parts.append(prim(
            'cone', f'Transverse_{index}_{side}',
            location=(side * (r + 0.055), y - r * 0.7, z + 0.005),
            scale=(0.035, 0.035, 0.11),
            rotation=(math.radians(90), 0, side * math.radians(-24)),
            verts=10, r2=0.55,
        ))
        # Суставные отростки
        parts.append(prim(
            'cube', f'Facet_{index}_{side}',
            location=(side * r * 0.72, y - r * 0.85, z + 0.045),
            scale=(0.032, 0.03, 0.038),
        ))

    # Остистый отросток: у грудных длинный и опущен, у поясничных короче
    length = {'cervical': 0.075, 'thoracic': 0.135, 'lumbar': 0.10}[kind]
    tilt = {'cervical': 8, 'thoracic': 38, 'lumbar': 6}[kind]
    parts.append(prim(
        'cone', f'Spinous_{index}',
        location=(0, y - r - length * 0.52, z - length * 0.34),
        scale=(0.026, 0.03, length),
        rotation=(math.radians(90 + tilt), 0, 0),
        verts=8, r2=0.5,
    ))
    return merge(parts, f'Vertebra_{index}')


def spine():
    objects = []
    count = 24
    for j in range(count):
        u = j / (count - 1)
        z = 1.46 - u * 2.78
        # Физиологические изгибы: шейный лордоз, грудной кифоз, поясничный лордоз
        y = SPINE_Y + 0.075 * math.sin(u * math.pi * 2.0 + 0.4)
        size = 0.055 + u * 0.048
        kind = 'cervical' if j < 7 else ('thoracic' if j < 19 else 'lumbar')
        objects.append(vertebra(z, y, size, kind, j))
    return objects


# --- грудная клетка -------------------------------------------------------

def ribs():
    objects = []
    # Ребро в сечении — плоская пластина, а не круглая трубка
    rib_profile = make_profile('RibProfile', 0.036, 0.013)
    cart_profile = make_profile('CartProfile', 0.021, 0.014)

    for i in range(PAIRS):
        t = i / (PAIRS - 1)
        swell = math.sin(math.pi * (0.20 + t * 0.72))
        half_w = 0.30 + swell * 0.42 - t * 0.05
        half_d = half_w * 0.86

        floating = i >= PAIRS - 2
        # Угол дуги считается из геометрии: ребро обрывается там, где
        # подходит к грудине, иначе средние рёбра проскакивают мимо неё
        reach = (STERNUM_Y - 0.13 - SPINE_Y) / max(half_d, 1e-4)
        theta_fit = math.acos(max(-1.0, min(1.0, 1.0 - reach)))
        theta_max = math.pi * 0.55 if floating else min(theta_fit, math.pi * 0.92)

        z_spine = 1.02 - t * 1.74
        drop = 0.17 + t * 0.22

        for side in (1, -1):
            pts = []
            steps = 30
            for s in range(steps + 1):
                th = theta_max * s / steps
                x = side * half_w * math.sin(th)
                y = SPINE_Y + half_d * (1 - math.cos(th))
                z = z_spine - drop * (th / math.pi)
                # Угол ребра: у позвоночника ребро резко отгибается назад
                if th < 0.5:
                    z += 0.035 * (0.5 - th)
                pts.append((x, y, z))

            objects.append(tube(pts, f'Rib_{i:02d}_{side}', profile=rib_profile,
                                taper=lambda u: 1.0 - 0.3 * u))

            if not floating and i < 10:
                end = pts[-1]
                objects.append(tube([
                    end,
                    (side * (abs(end[0]) * 0.6 + 0.05), STERNUM_Y - 0.06, end[2] + drop * 0.16),
                    (side * 0.065, STERNUM_Y - 0.01, end[2] + drop * 0.26),
                ], f'Cartilage_{i:02d}_{side}', profile=cart_profile))
    return objects


def sternum():
    return [
        prim('cube', 'Manubrium', location=(0, STERNUM_Y + 0.02, 0.86),
             scale=(0.17, 0.05, 0.15), rotation=(math.radians(-6), 0, 0)),
        prim('cube', 'SternumBody', location=(0, STERNUM_Y, 0.50),
             scale=(0.115, 0.045, 0.42), rotation=(math.radians(-6), 0, 0)),
        prim('cone', 'Xiphoid', location=(0, STERNUM_Y - 0.02, 0.20),
             scale=(0.05, 0.032, 0.13), rotation=(math.radians(174), 0, 0),
             verts=10, r2=0.3),
    ]


# --- плечевой пояс --------------------------------------------------------

def shoulder():
    objects = []
    blade_profile = make_profile('BladeProfile', 0.09, 0.016)

    for side in (1, -1):
        # Ключица — S-образная
        objects.append(tube([
            (side * 0.05, STERNUM_Y - 0.02, 0.95),
            (side * 0.22, STERNUM_Y - 0.10, 1.00),
            (side * 0.40, SPINE_Y + 0.40, 1.00),
            (side * 0.54, SPINE_Y + 0.26, 0.96),
        ], f'Clavicle_{side}', radius=0.026))

        # Лопатка: плоская пластина по задней поверхности клетки
        objects.append(tube([
            (side * 0.30, SPINE_Y - 0.02, 0.92),
            (side * 0.46, SPINE_Y + 0.06, 0.72),
            (side * 0.50, SPINE_Y + 0.14, 0.48),
            (side * 0.40, SPINE_Y + 0.16, 0.30),
        ], f'Scapula_{side}', profile=blade_profile,
            taper=lambda u: 1.0 - 0.45 * u))

        # Ость лопатки и акромион
        objects.append(tube([
            (side * 0.28, SPINE_Y - 0.06, 0.90),
            (side * 0.50, SPINE_Y - 0.02, 0.94),
        ], f'Spine_scapula_{side}', radius=0.022))
        objects.append(prim('sphere', f'Acromion_{side}',
                            location=(side * 0.56, SPINE_Y + 0.06, 0.94),
                            scale=(0.06, 0.05, 0.045), segments=14, rings=10))
    return objects


# --- череп ----------------------------------------------------------------

def skull():
    """Мозговой и лицевой отделы. Глазницы и нос — булевы вырезы."""
    # Свод черепа
    cranium = prim('sphere', 'Cranium', location=(0, -0.10, 1.90),
                   scale=(0.285, 0.325, 0.30), segments=32, rings=22)
    # Затылок — выступ кзади
    occiput = prim('sphere', 'Occiput', location=(0, -0.30, 1.80),
                   scale=(0.19, 0.14, 0.17), segments=20, rings=14)
    # Лицевой отдел
    face = prim('sphere', 'Face', location=(0, 0.09, 1.72),
                scale=(0.20, 0.19, 0.17), segments=26, rings=18)

    # Именно UNION, а не join: join оставляет три пересекающиеся оболочки,
    # на которых булева разность вырезает не глазницу, а весь череп.
    braincase = carve(cranium, [occiput, face], operation='UNION')
    braincase.name = 'Braincase'

    # Резаки держим строго внутри объёма черепа: крупные секущие тела
    # на стыке трёх слитых сфер дают невалидную геометрию, и EXACT-солвер
    # вырезает не впадину, а весь череп целиком.
    cuts = []
    for side in (1, -1):
        # Глазницы: конус, направленный внутрь и назад
        cuts.append(cutter('cone',
                           location=(side * 0.105, 0.185, 1.775),
                           scale=(0.078, 0.072, 0.16),
                           rotation=(math.radians(-100), 0, side * math.radians(12)),
                           verts=16, r2=0.12))
    # Носовое отверстие — грушевидное
    cuts.append(cutter('cone', location=(0, 0.215, 1.675),
                       scale=(0.042, 0.042, 0.13),
                       rotation=(math.radians(-94), 0, 0), verts=14, r2=0.35))

    before = len(braincase.data.vertices)
    braincase = carve(braincase, cuts)
    print(f'[skeleton] череп: вершин до вырезов {before}, после {len(braincase.data.vertices)}')

    objects = [braincase]

    # Скуловые дуги — от щеки к слуховому проходу
    for side in (1, -1):
        objects.append(tube([
            (side * 0.145, 0.20, 1.735),
            (side * 0.245, 0.10, 1.755),
            (side * 0.275, -0.04, 1.775),
            (side * 0.235, -0.14, 1.790),
        ], f'Zygomatic_{side}', radius=0.021))

        # Ветвь нижней челюсти с мыщелком
        objects.append(tube([
            (side * 0.205, -0.115, 1.800),
            (side * 0.200, -0.075, 1.690),
            (side * 0.185, -0.020, 1.600),
        ], f'Ramus_{side}', radius=0.026))
        objects.append(prim('sphere', f'Condyle_{side}',
                            location=(side * 0.205, -0.125, 1.815),
                            scale=(0.032, 0.030, 0.026), segments=12, rings=8))

    # Тело нижней челюсти — подкова
    jaw_profile = make_profile('JawProfile', 0.028, 0.038)
    jaw = []
    for s in range(25):
        th = math.pi * s / 24
        jaw.append((0.185 * math.cos(th), 0.055 + 0.175 * math.sin(th), 1.585))
    objects.append(tube(jaw, 'Mandible', profile=jaw_profile, caps=False))

    # Зубные ряды — тонкие дуги, читаются как ряд, а не как отдельные зубы
    teeth_profile = make_profile('TeethProfile', 0.020, 0.030)
    upper = []
    for s in range(21):
        th = math.pi * s / 20
        upper.append((0.155 * math.cos(th), 0.065 + 0.150 * math.sin(th), 1.632))
    objects.append(tube(upper, 'TeethUpper', profile=teeth_profile, caps=False))

    lower = []
    for s in range(21):
        th = math.pi * s / 20
        lower.append((0.152 * math.cos(th), 0.062 + 0.148 * math.sin(th), 1.636))
    objects.append(tube(lower, 'TeethLower', profile=teeth_profile, caps=False))

    return objects


# --- таз ------------------------------------------------------------------

def pelvis():
    objects = []

    for side in (1, -1):
        # Крыло подвздошной кости: оболочка из двух сфер даёт вогнутую ямку
        wing = prim('sphere', f'Ilium_{side}',
                    location=(side * 0.30, SPINE_Y + 0.18, -1.36),
                    scale=(0.30, 0.27, 0.115),
                    rotation=(math.radians(78), side * math.radians(14),
                              side * math.radians(-28)),
                    segments=28, rings=18)
        # Подвздошная ямка — вычитаем смещённую сферу
        fossa = cutter('sphere',
                       location=(side * 0.30, SPINE_Y + 0.26, -1.30),
                       scale=(0.27, 0.24, 0.10),
                       rotation=(math.radians(78), side * math.radians(14),
                                 side * math.radians(-28)),
                       segments=24, rings=16)
        # Срезаем нижнюю половину крыла — там начинается седалищная кость
        trim = cutter('cube', location=(side * 0.30, SPINE_Y + 0.16, -1.78),
                      scale=(0.9, 0.9, 0.5))
        wing = carve(wing, [fossa, trim])
        objects.append(wing)

        # Вертлужная впадина
        socket = prim('sphere', f'Acetabulum_{side}',
                      location=(side * 0.255, SPINE_Y + 0.30, -1.56),
                      scale=(0.085, 0.085, 0.075), segments=16, rings=12)
        dimple = cutter('sphere', location=(side * 0.315, SPINE_Y + 0.33, -1.56),
                        scale=(0.062, 0.062, 0.058), segments=14, rings=10)
        objects.append(carve(socket, [dimple]))

        # Седалищная и лобковая кости замыкают запирательное отверстие
        ring_profile = make_profile(f'RamusProfile_{side}', 0.036, 0.028)
        ring = []
        for s in range(19):
            th = 2 * math.pi * s / 18
            ring.append((
                side * (0.185 + 0.075 * math.cos(th)),
                SPINE_Y + 0.30 + 0.115 * math.cos(th) * 0.5 + 0.10 * math.sin(th),
                -1.74 + 0.115 * math.sin(th) * 0.6 - 0.05 * math.cos(th),
            ))
        objects.append(tube(ring, f'ObturatorRing_{side}',
                            profile=ring_profile, caps=False))

    # Крестец: клин с изгибом, срастается с копчиком
    sacrum = []
    for s in range(7):
        u = s / 6
        sacrum.append((0, SPINE_Y - 0.02 + 0.10 * u * u, -1.28 - u * 0.42))
    sac_profile = make_profile('SacrumProfile', 0.155, 0.075)
    objects.append(tube(sacrum, 'Sacrum', profile=sac_profile,
                        taper=lambda u: 1.0 - 0.62 * u))

    return objects


# --- конечности -----------------------------------------------------------

def joint(name, location, radius):
    return prim('sphere', name, location=location,
                scale=(radius, radius, radius * 0.9), segments=14, rings=10)


def limbs():
    objects = []

    for side in (1, -1):
        # --- рука ---
        sh = (side * 0.60, SPINE_Y + 0.14, 0.90)
        elbow = (side * 0.72, SPINE_Y + 0.20, 0.10)
        wrist = (side * 0.78, SPINE_Y + 0.34, -0.62)

        objects.append(joint(f'HumerusHead_{side}', sh, 0.058))
        objects.append(tube([sh, (side * 0.67, SPINE_Y + 0.16, 0.50), elbow],
                            f'Humerus_{side}', radius=0.042,
                            taper=lambda u: 1.0 - 0.18 * math.sin(u * math.pi)))
        objects.append(joint(f'Elbow_{side}', elbow, 0.048))
        # Локтевая и лучевая идут парой
        objects.append(tube([elbow, (side * 0.755, SPINE_Y + 0.26, -0.26), wrist],
                            f'Ulna_{side}', radius=0.031))
        objects.append(tube([(side * 0.685, SPINE_Y + 0.255, 0.055),
                             (side * 0.715, SPINE_Y + 0.315, -0.27),
                             (side * 0.745, SPINE_Y + 0.395, -0.61)],
                            f'Radius_{side}', radius=0.026))
        objects.append(joint(f'Carpus_{side}', wrist, 0.042))
        # Пясть и пальцы
        for f in range(4):
            off = (f - 1.5) * 0.036
            objects.append(tube([
                (side * 0.78 + off * 0.4, SPINE_Y + 0.34 + off, -0.66),
                (side * 0.79 + off * 0.6, SPINE_Y + 0.35 + off * 1.4, -0.90),
            ], f'Finger_{side}_{f}', radius=0.013))

        # --- нога ---
        hip = (side * 0.255, SPINE_Y + 0.31, -1.57)
        knee = (side * 0.235, SPINE_Y + 0.36, -2.62)
        ankle = (side * 0.225, SPINE_Y + 0.34, -3.60)

        objects.append(joint(f'FemurHead_{side}', hip, 0.062))
        objects.append(tube([hip,
                             (side * 0.30, SPINE_Y + 0.30, -1.72),
                             (side * 0.255, SPINE_Y + 0.34, -2.20),
                             knee], f'Femur_{side}', radius=0.056,
                            taper=lambda u: 1.0 - 0.14 * math.sin(u * math.pi)))
        objects.append(joint(f'Knee_{side}', knee, 0.058))
        objects.append(tube([knee, (side * 0.23, SPINE_Y + 0.35, -3.10), ankle],
                            f'Tibia_{side}', radius=0.045,
                            taper=lambda u: 1.0 - 0.25 * u))
        objects.append(tube([(side * 0.305, SPINE_Y + 0.33, -2.70),
                             (side * 0.295, SPINE_Y + 0.32, -3.55)],
                            f'Fibula_{side}', radius=0.022))
        objects.append(joint(f'Ankle_{side}', ankle, 0.048))
        # Стопа
        objects.append(tube([ankle,
                             (side * 0.225, SPINE_Y + 0.45, -3.70),
                             (side * 0.225, SPINE_Y + 0.62, -3.73)],
                            f'Foot_{side}', radius=0.038,
                            taper=lambda u: 1.0 - 0.35 * u))
        objects.append(prim('cube', f'Heel_{side}',
                            location=(side * 0.225, SPINE_Y + 0.24, -3.70),
                            scale=(0.07, 0.10, 0.07)))

    return objects


# --- сборка ---------------------------------------------------------------

def main():
    clear_scene()

    parts = []
    parts += ribs()
    parts += spine()
    parts += sternum()
    parts += shoulder()
    parts += skull()
    parts += pelvis()
    parts += limbs()

    # Убираем временные профили сечений
    for obj in _scratch:
        try:
            bpy.data.objects.remove(obj, do_unlink=True)
        except ReferenceError:
            pass
    _scratch.clear()

    merged = merge(parts, 'Skeleton')

    activate(merged)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    merged.location = (0, 0, 0)
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    except AttributeError:
        bpy.ops.object.shade_smooth()

    # Бюджет полигонов: модель грузится в hero, поэтому вес важнее
    # микродеталей. Collapse-децимация на сглаженных формах незаметна.
    tris_before = sum(len(p.vertices) - 2 for p in merged.data.polygons)
    budget = 42000
    if tris_before > budget:
        activate(merged)
        dec = merged.modifiers.new('decimate', 'DECIMATE')
        dec.decimate_type = 'COLLAPSE'
        dec.ratio = budget / tris_before
        bpy.ops.object.modifier_apply(modifier=dec.name)
        print(f'[skeleton] децимация: {tris_before} → бюджет {budget}')

    xs = [v.co.x for v in merged.data.vertices]
    ys = [v.co.y for v in merged.data.vertices]
    zs = [v.co.z for v in merged.data.vertices]
    tris = sum(len(p.vertices) - 2 for p in merged.data.polygons)

    print(f'[skeleton] треугольников: ~{tris}')
    print(f'[skeleton] габарит X: {min(xs):.3f} .. {max(xs):.3f}')
    print(f'[skeleton] габарит Y: {min(ys):.3f} .. {max(ys):.3f}')
    print(f'[skeleton] габарит Z: {min(zs):.3f} .. {max(zs):.3f}')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=False,
        export_materials='EXPORT',
    )
    print(f'[skeleton] экспортировано: {OUT}')


if __name__ == '__main__':
    main()
    sys.exit(0)

"""
Генератор модели торсового скелета для сайта «Анатомический эрмитаж».

Запуск (Blender 4.x / 5.x):
    blender --background --python tools/build_skeleton.py

Результат: public/models/skeleton.glb

Почему скриптом, а не ручным моделированием: анатомия здесь описывается
параметрами (обхват клетки по парам рёбер, наклон, длина хрящей), поэтому
правки вносятся числом, а не переклеиванием вершин. Модель остаётся
воспроизводимой и версионируется вместе с кодом.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

# --- параметры анатомии ---------------------------------------------------

PAIRS = 12            # пар рёбер
SPINE_Y = -0.50       # позвоночник смещён назад (Blender: +Y = вперёд)
STERNUM_Y = 0.46      # грудина спереди
BONE_NAME = 'Bone'

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'public', 'models', 'skeleton.glb')


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
    # Матовая кость: никакого «мокрого» блеска — это сухой препарат
    bsdf.inputs['Base Color'].default_value = (0.86, 0.83, 0.76, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.72
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = 0.0
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.25
    elif 'Specular' in bsdf.inputs:
        bsdf.inputs['Specular'].default_value = 0.25
    return mat


def finish(obj):
    """Общая отделка: материал, сглаживание, лёгкая фаска."""
    obj.data.materials.clear()
    obj.data.materials.append(bone_material())
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def tube_from_points(points, radius, name, taper=None, res=3):
    """Труба вдоль ломаной: кривая + bevel. taper — множитель радиуса по длине."""
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 3
    curve.bevel_depth = radius
    curve.bevel_resolution = res
    curve.use_fill_caps = True

    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for i, p in enumerate(points):
        w = 1.0 if taper is None else taper(i / max(len(points) - 1, 1))
        spline.points[i].co = (p[0], p[1], p[2], 1.0)
        spline.points[i].radius = w

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return finish(obj)


def add_primitive(kind, name, location=(0, 0, 0), scale=(1, 1, 1),
                  rotation=(0, 0, 0), **kwargs):
    if kind == 'sphere':
        bpy.ops.mesh.primitive_uv_sphere_add(segments=kwargs.get('segments', 24),
                                             ring_count=kwargs.get('rings', 14),
                                             radius=1.0, location=location)
    elif kind == 'cylinder':
        bpy.ops.mesh.primitive_cylinder_add(vertices=kwargs.get('verts', 14),
                                            radius=1.0, depth=1.0, location=location)
    elif kind == 'cube':
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rotation
    return finish(obj)


# --- анатомия -------------------------------------------------------------

def rib_pair(i):
    """Одна пара рёбер + рёберные хрящи. Дуга идёт от позвонка вбок и вперёд."""
    t = i / (PAIRS - 1)

    # Обхват максимален на 7—8 паре, книзу клетка сужается
    swell = math.sin(math.pi * (0.20 + t * 0.72))
    half_w = 0.30 + swell * 0.42 - t * 0.05     # полуширина (X)
    half_d = half_w * 0.86                       # полуглубина (Y)
    radius = 0.030 - t * 0.006

    floating = i >= PAIRS - 2                    # XI и XII — колеблющиеся

    # Дуга обрывается там, где ребро подходит к грудине спереди.
    # Угол считается из геометрии, иначе длинные средние рёбра
    # проскакивают мимо грудины и торчат вперёд палками.
    reach = (STERNUM_Y - 0.13 - SPINE_Y) / max(half_d, 1e-4)
    theta_fit = math.acos(max(-1.0, min(1.0, 1.0 - reach)))
    theta_max = math.pi * 0.55 if floating else min(theta_fit, math.pi * 0.92)

    z_spine = 1.02 - t * 1.74
    drop = 0.17 + t * 0.22                       # передний конец ниже заднего

    objects = []
    for side in (1, -1):
        pts = []
        steps = 26
        for s in range(steps + 1):
            th = theta_max * s / steps
            x = side * half_w * math.sin(th)
            y = SPINE_Y + half_d * (1 - math.cos(th))
            z = z_spine - drop * (th / math.pi)
            pts.append((x, y, z))

        rib = tube_from_points(
            pts, radius, f'Rib_{i:02d}_{"L" if side > 0 else "R"}',
            taper=lambda u: 1.0 - 0.35 * u,      # ребро истончается кпереди
        )
        objects.append(rib)

        # Рёберный хрящ: от конца ребра вверх-внутрь к грудине.
        # Именно этот разрыв отличает грудную клетку от бочки.
        if not floating and i < 10:
            end = pts[-1]
            # Хрящ идёт от конца ребра вперёд-вверх-внутрь к краю грудины
            cart = [
                end,
                (side * (abs(end[0]) * 0.6 + 0.05), STERNUM_Y - 0.06, end[2] + drop * 0.16),
                (side * 0.065, STERNUM_Y - 0.01, end[2] + drop * 0.26),
            ]
            objects.append(
                tube_from_points(cart, radius * 0.62, f'Cartilage_{i:02d}_{side}')
            )
    return objects


def spine():
    """24 позвонка: тело + остистый отросток, направленный назад и вниз."""
    objects = []
    count = 24
    for j in range(count):
        u = j / (count - 1)
        z = 1.46 - u * 2.78
        # Поясничные позвонки массивнее шейных
        r = 0.052 + u * 0.042
        # Лёгкий физиологический изгиб
        y = SPINE_Y - 0.06 * math.sin(u * math.pi * 2.0)

        objects.append(add_primitive(
            'cylinder', f'Vertebra_{j:02d}',
            location=(0, y, z), scale=(r, r * 0.9, 0.062), verts=14,
        ))
        objects.append(add_primitive(
            'cube', f'Spinous_{j:02d}',
            location=(0, y - r - 0.055, z - 0.03),
            scale=(0.022, 0.085 + u * 0.02, 0.034),
            rotation=(math.radians(18), 0, 0),
        ))
    return objects


def sternum():
    objects = [
        add_primitive('cube', 'Manubrium',
                      location=(0, STERNUM_Y + 0.02, 0.86),
                      scale=(0.17, 0.05, 0.15), rotation=(math.radians(-6), 0, 0)),
        add_primitive('cube', 'SternumBody',
                      location=(0, STERNUM_Y, 0.50),
                      scale=(0.115, 0.045, 0.42), rotation=(math.radians(-6), 0, 0)),
        add_primitive('cube', 'Xiphoid',
                      location=(0, STERNUM_Y - 0.02, 0.22),
                      scale=(0.05, 0.035, 0.10), rotation=(math.radians(-6), 0, 0)),
    ]
    # Ключицы: от рукоятки грудины к плечу
    for side in (1, -1):
        objects.append(tube_from_points(
            [(side * 0.06, STERNUM_Y, 0.95),
             (side * 0.30, STERNUM_Y - 0.06, 1.02),
             (side * 0.52, SPINE_Y + 0.30, 1.00)],
            0.028, f'Clavicle_{side}',
        ))
    return objects


def skull():
    # Череп сидит на верхнем шейном позвонке (z ≈ 1.46), а не висит над ним
    objects = [
        # Мозговой отдел
        add_primitive('sphere', 'Cranium', location=(0, -0.14, 1.90),
                      scale=(0.29, 0.33, 0.31), segments=28, rings=18),
        # Лицевой отдел — ниже и впереди мозгового
        add_primitive('sphere', 'Maxilla', location=(0, 0.08, 1.74),
                      scale=(0.20, 0.19, 0.16), segments=22, rings=14),
    ]
    # Нижняя челюсть — дуга
    jaw = []
    for s in range(21):
        th = math.pi * s / 20
        jaw.append((0.165 * math.cos(th), 0.06 + 0.16 * math.sin(th), 1.60))
    objects.append(tube_from_points(jaw, 0.032, 'Mandible'))
    # Затылок и переход к шее — закрывает стык черепа с позвоночником
    objects.append(add_primitive('sphere', 'Occiput', location=(0, -0.26, 1.66),
                                 scale=(0.13, 0.12, 0.12), segments=18, rings=12))
    return objects


def pelvis():
    objects = []
    # Крылья подвздошных костей: плоские и развёрнутые наружу,
    # иначе таз читается как два шара
    for side in (1, -1):
        objects.append(add_primitive(
            'sphere', f'Ilium_{side}',
            location=(side * 0.30, SPINE_Y + 0.20, -1.44),
            scale=(0.30, 0.25, 0.055),
            rotation=(math.radians(80), side * math.radians(16), side * math.radians(-30)),
            segments=22, rings=14,
        ))
    # Лобковая дуга
    arch = []
    for s in range(19):
        th = math.pi * s / 18
        arch.append((0.22 * math.cos(th), SPINE_Y + 0.12 + 0.32 * math.sin(th), -1.70))
    objects.append(tube_from_points(arch, 0.042, 'PubicArch'))
    # Крестец
    objects.append(add_primitive('cube', 'Sacrum',
                                 location=(0, SPINE_Y - 0.01, -1.46),
                                 scale=(0.17, 0.11, 0.30),
                                 rotation=(math.radians(14), 0, 0)))
    return objects


# --- сборка ---------------------------------------------------------------

def main():
    clear_scene()

    parts = []
    for i in range(PAIRS):
        parts += rib_pair(i)
    parts += spine()
    parts += sternum()
    parts += skull()
    parts += pelvis()

    # Сливаем всё в один объект: один draw call на клиенте
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()

    merged = bpy.context.active_object
    merged.name = 'Skeleton'

    # Центрируем по геометрии, чтобы в сцене вращать вокруг себя
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    merged.location = (0, 0, 0)

    tris = sum(len(p.vertices) - 2 for p in merged.data.polygons)
    print(f'[skeleton] полигонов: {len(merged.data.polygons)}, треугольников: ~{tris}')

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

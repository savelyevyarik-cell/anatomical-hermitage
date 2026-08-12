import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Процедурная грудная клетка.
 *
 * Ключевая деталь: дуга ребра лежит в ГОРИЗОНТАЛЬНОЙ плоскости и идёт
 * от позвоночника через бок вперёд, к грудине. Дуга не замыкается —
 * между её передним концом и грудиной остаётся промежуток, который
 * заполняет рёберный хрящ. Именно этот разрыв и разная длина пар
 * отличают грудную клетку от бочки.
 *
 * Вся геометрия сливается в один буфер: одна отрисовка вместо
 * полусотни мешей. Результат центрируется по началу координат.
 */

const SPINE_Z = -0.52; // задняя точка, где рёбра сходятся с позвоночником
const DEPTH = 0.72; // клетка сплющена спереди назад
const PAIRS = 12;

export function buildCage() {
  const parts: THREE.BufferGeometry[] = [];

  // Грудина: узкая пластина по средней линии спереди
  const sternumZ = SPINE_Z + 0.66 * DEPTH * 1.72;
  const sternum = new THREE.BoxGeometry(0.14, 0.92, 0.06);
  sternum.rotateX(-0.1);
  sternum.translate(0, 0.46, sternumZ - 0.1);
  parts.push(sternum);

  for (let i = 0; i < PAIRS; i++) {
    const t = i / (PAIRS - 1);

    // Обхват: максимум приходится на 6—8 пару, книзу клетка сужается
    const swell = Math.sin(Math.PI * (0.2 + t * 0.72));
    const radius = 0.26 + swell * 0.4 - t * 0.05;
    const tube = 0.038 - t * 0.008;

    // Две нижние пары — «колеблющиеся»: короткие, без выхода на грудину
    const floating = i >= PAIRS - 2;
    // Дуга почти доходит до средней линии: клетка смыкается спереди сама,
    // без отдельных хрящевых перемычек — они читались как торчащие спицы
    const arc = Math.PI * (floating ? 0.62 : 0.9 - t * 0.05);
    const tilt = 0.14 + t * 0.28; // передний конец ребра ниже заднего
    const y = 1.02 - t * 1.72;

    const base = new THREE.TorusGeometry(radius, tube, 7, 40, arc);
    base.rotateX(-Math.PI / 2); // дуга ложится в горизонтальную плоскость
    base.rotateY(Math.PI / 2 - arc); // конец дуги приходит точно к позвоночнику
    base.rotateX(tilt);

    for (const side of [1, -1]) {
      const rib = base.clone();
      rib.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(0, y, SPINE_Z + radius * DEPTH),
          new THREE.Quaternion(),
          new THREE.Vector3(side, 1, DEPTH)
        )
      );
      parts.push(rib);
    }
    base.dispose();
  }

  // Позвоночник: позвонки уменьшаются книзу
  const vertebrae = 15;
  for (let i = 0; i < vertebrae; i++) {
    const t = i / (vertebrae - 1);
    const v = new THREE.CylinderGeometry(0.075 - t * 0.01, 0.072 - t * 0.01, 0.095, 10);
    v.translate(0, 1.2 - t * 2.0, SPINE_Z - 0.045);
    parts.push(v);
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  merged.computeVertexNormals();
  merged.center();
  return merged;
}

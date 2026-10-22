import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { AREAS, ARTERIES, ELECTRODE_INFO, LOBES, areaAt, arteryAt, describePoint, electrodeDirection, lobeAt } from "../../src/neuro/brainRegions.js";
import { ELECTRODES } from "../../src/eeg/generator.js";

// Points are model millimetres: x lateral (+ = patient's left), y up, z anterior.
describe("3D brain regions", () => {
  it("places the poles and the posterior fossa correctly", () => {
    expect(lobeAt([20, 50, 47])).toBe("frontal"); // frontal pole
    expect(lobeAt([15, 45, -48])).toBe("occipital"); // occipital pole
    expect(lobeAt([30, 70, -15])).toBe("parietal");
    expect(lobeAt([32, 36, 0])).toBe("temporal"); // below the Sylvian fissure
    expect(lobeAt([20, 20, -30])).toBe("cerebellum");
    expect(lobeAt([0, 10, -20])).toBe("brainstem");
  });

  it("puts the motor strip in front of the sensory strip, both above the Sylvian fissure", () => {
    expect(areaAt([30, 67, 4])).toBe("motor");
    expect(areaAt([30, 67, -3])).toBe("sensory");
    expect(areaAt([30, 40, 4])).not.toBe("motor");
  });

  it("puts the language areas on the left only", () => {
    expect(areaAt([30, 46, 16])).toBe("broca");
    expect(areaAt([-30, 46, 16])).not.toBe("broca");
    expect(areaAt([32, 38, -15])).toBe("wernicke");
    expect(areaAt([-32, 38, -15])).not.toBe("wernicke");
    expect(areaAt([12, 40, -46])).toBe("visual");
  });

  it("assigns arterial territories like the textbook map", () => {
    expect(arteryAt([5, 75, 10])).toBe("aca"); // parasagittal convexity
    expect(arteryAt([30, 60, 10])).toBe("mca"); // lateral convexity
    expect(arteryAt([15, 45, -45])).toBe("pca"); // occipital
    expect(arteryAt([20, 20, -30])).toBe("vb"); // cerebellum
    expect(describePoint([0, 84, 0]).side).toBe("midline");
    expect(describePoint([30, 60, 10]).side).toBe("left");
  });

  it("projects 10-20 electrodes in the right directions", () => {
    const cz = electrodeDirection(ELECTRODES.Cz);
    expect(cz[1]).toBeCloseTo(1, 5);
    const t3 = electrodeDirection(ELECTRODES.T3); // left mid-temporal: lateral (+x), level
    expect(t3[0]).toBeGreaterThan(0.95);
    expect(Math.abs(t3[1])).toBeLessThan(0.05);
    const fp2 = electrodeDirection(ELECTRODES.Fp2); // right frontopolar: anterior and right (-x)
    expect(fp2[2]).toBeGreaterThan(0.8);
    expect(fp2[0]).toBeLessThan(0);
  });

  it("has a description for every electrode, lobe, area and artery", () => {
    for (const e of ["Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8", "T3", "C3", "Cz", "C4", "T4", "T5", "P3", "Pz", "P4", "T6", "O1", "O2"]) expect(ELECTRODE_INFO[e]?.length, e).toBeGreaterThan(30);
    for (const set of [LOBES, AREAS, ARTERIES]) for (const [k, d] of Object.entries(set)) {
      expect(d.label, k).toBeTruthy();
      expect(d.text.length, k).toBeGreaterThan(40);
      expect(d.color).toHaveLength(3);
    }
  });

  it("ships the web model with its licence notice", () => {
    const dir = path.resolve(__dirname, "../../public/models/brain");
    const gltf = JSON.parse(fs.readFileSync(path.join(dir, "brain.gltf"), "utf8"));
    for (const im of gltf.images) expect(fs.existsSync(path.join(dir, im.uri)), im.uri).toBe(true);
    for (const b of gltf.buffers) expect(fs.existsSync(path.join(dir, b.uri)), b.uri).toBe(true);
    expect(fs.readFileSync(path.join(dir, "LICENSE.txt"), "utf8")).toMatch(/CC BY 4\.0/);
  });
});

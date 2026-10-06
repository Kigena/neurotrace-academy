/**
 * Amplifier-control and filter math used by the Amplifier & Filters Lab and its tests.
 * Single-pole (first-order, 6 dB/octave) filters, the textbook EEG model.
 */

/** Single-pole high-pass (low-frequency filter) gain at `f` Hz for a cutoff `fc` Hz. */
export const highPassGain = (f, fc) => (fc > 0 ? f / Math.sqrt(f * f + fc * fc) : 1);

/** Single-pole low-pass (high-frequency filter) gain at `f` Hz for a cutoff `fc` Hz. */
export const lowPassGain = (f, fc) => (fc > 0 ? 1 / Math.sqrt(1 + (f / fc) ** 2) : 1);

/** Combined LFF + HFF gain (0..1) at `f` Hz. */
export const bandGain = (f, lff, hff) => highPassGain(f, lff) * lowPassGain(f, hff);

/** Amplitude ratio to decibels (20 log10). */
export const gainToDb = (gain) => 20 * Math.log10(gain);

/** Time constant in seconds for a filter cutoff in Hz: TC = 1 / (2 pi f). */
export const timeConstantFromCutoff = (fc) => 1 / (2 * Math.PI * fc);

/** Cutoff in Hz for a time constant in seconds: f = 1 / (2 pi TC). */
export const cutoffFromTimeConstant = (tc) => 1 / (2 * Math.PI * tc);

/** Sensitivity (uV/mm) from a voltage (uV) and the height it occupies (mm): S = V / H. */
export const sensitivity = (uv, mm) => uv / mm;

/** Voltage (uV) from sensitivity (uV/mm) and pen height (mm): V = S x H. */
export const voltageFromHeight = (sens, mm) => sens * mm;

/** Pen height (mm) for a voltage (uV) at a sensitivity (uV/mm): H = V / S. */
export const heightFromVoltage = (sens, uv) => uv / sens;

/** Amplitude of a wave from the calibration pulse on the same page. */
export const amplitudeFromCalibration = (calUv, calHeightMm, waveHeightMm) => (calUv * waveHeightMm) / calHeightMm;

/** Duration (ms) of a wave from its width (mm) and the paper speed (mm/s). */
export const durationMs = (widthMm, mmPerSec) => (widthMm / mmPerSec) * 1000;

/** Width (mm) of a wave lasting `ms` at a paper speed (mm/s). */
export const widthMm = (ms, mmPerSec) => (ms / 1000) * mmPerSec;

/** Frequency (Hz) from a period (ms). */
export const frequencyHz = (ms) => 1000 / ms;

/** Standard cutoff choices offered by the Filter Lab. */
export const LFF_CHOICES = [0.1, 0.3, 0.5, 1, 1.6, 5.3];
export const HFF_CHOICES = [15, 35, 70];

const RAD = 180 / Math.PI;

/** Phase LEAD (degrees) a single-pole LFF gives a sine of `f` Hz: atan(fc / f). Positive = the wave peaks earlier. */
export const highPassPhaseDeg = (f, fc) => (fc > 0 ? Math.atan(fc / f) * RAD : 0);

/** Phase LAG (degrees) a single-pole HFF gives a sine of `f` Hz: atan(f / fc). Positive = the wave peaks later. */
export const lowPassPhaseDeg = (f, fc) => (fc > 0 ? Math.atan(f / fc) * RAD : 0);

/** Time shift in ms for a phase in degrees at frequency `f` Hz. */
export const phaseToMs = (deg, f) => (deg / 360) * (1000 / f);

/** Net timing shift (ms) of a sine through LFF and HFF: negative = earlier, positive = later. */
export const netShiftMs = (f, lff, hff) => phaseToMs(lowPassPhaseDeg(f, hff) - highPassPhaseDeg(f, lff), f);

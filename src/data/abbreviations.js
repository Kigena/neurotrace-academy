// Abbreviations an EEG / neurodiagnostic technologist meets, grouped by setting.
// Each row is [abbreviation, what it stands for, why it matters to the tech].
// The ICU groups are read from icuEeg.json (the ICU & cEEG page) so there is one
// copy of them; the other groups live here. Local usage varies: when an
// abbreviation on an order is ambiguous, ask.
import icuEeg from "./icuEeg.json";

const LAB_GROUPS = [
  {
    id: "recording",
    title: "EEG recording and instrumentation",
    blurb: "Settings, filters and procedures you see on the machine and the requisition.",
    rows: [
      ["LFF", "Low-frequency filter (a high-pass filter)", "Removes slow drift. Routine adult setting is 1 Hz; raising it hides real slowing."],
      ["HFF", "High-frequency filter (a low-pass filter)", "Removes fast noise. Routine setting is 70 Hz; lowering it can make muscle look like beta or blunt spikes."],
      ["TC", "Time constant", "Another way of stating the LFF: TC = 1 / (2π × f). A 1 Hz LFF is a TC of about 0.16 s."],
      ["Notch", "Notch filter (60 Hz in North America, 50 Hz elsewhere)", "Removes mains interference. Use only when needed and fix the cause (usually impedance) first."],
      ["µV/mm", "Microvolts per millimetre (sensitivity)", "Display gain. Routine adult EEG is around 7 µV/mm; a smaller number makes the traces bigger."],
      ["Hz", "Hertz, cycles per second", "Frequency. Delta under 4, theta 4 to under 8, alpha 8 to 13, beta above 13 Hz."],
      ["kΩ", "Kilohms (impedance)", "Electrode-skin impedance should be under 5 kΩ and balanced across electrodes."],
      ["CMRR", "Common mode rejection ratio", "How well a differential amplifier cancels signal common to both inputs (such as mains noise). Higher is better."],
      ["G1 / G2", "Grid 1 / Grid 2 (input 1 / input 2)", "The two amplifier inputs. By convention, G1 more negative than G2 deflects the pen upward."],
      ["Ref", "Reference electrode", "The shared second input in a referential montage. An active reference contaminates every channel."],
      ["GND", "Ground (isolated patient ground)", "Needed for common-mode rejection. Use one ground only, to avoid ground loops."],
      ["ADC", "Analogue-to-digital converter", "Digitises the signal; its sampling rate limits the highest frequency that can be recorded."],
      ["Fs", "Sampling frequency (sampling rate)", "Should be at least three times the HFF; 256 Hz or more is common for routine EEG."],
      ["Nyquist", "Nyquist frequency (half the sampling rate)", "Activity above it aliases, appearing falsely as slower activity."],
      ["Cal", "Calibration", "Square-wave calibration at the start and end of the record checks gain, filters and polarity."],
      ["Biocal", "Biological calibration", "Every channel recorded from the same electrode pair (such as Fp1-O2) to confirm the channels match."],
      ["ECG / EKG", "Electrocardiogram channel", "Required on every EEG; identifies ECG artifact and heart-rhythm changes during events."],
      ["EOG", "Electro-oculogram", "Eye-movement channel; separates eye movement from frontal slowing and is needed for sleep staging."],
      ["EMG (channel)", "Electromyogram channel", "Surface muscle channel (such as chin or deltoid) for sleep staging, myoclonus and movement timing."],
      ["HV", "Hyperventilation", "Activation for about 3 to 5 minutes. Avoid with recent stroke or SAH, moyamoya, sickle cell disease or significant heart or lung disease."],
      ["IPS / PS", "Intermittent photic stimulation", "Flash activation at set frequencies; look for a photoparoxysmal response."],
      ["PPR", "Photoparoxysmal response", "Epileptiform discharges triggered by photic stimulation; generalized PPR is linked to generalized epilepsy."],
            ["ECI / ECS", "Electrocerebral inactivity (silence)", "Brain-death recording protocol: 2 µV/mm, double-distance electrodes, at least 30 minutes, impedances 100 Ω to 10 kΩ."],
      ["AC / DC", "Alternating current / direct current", "DC (no LFF) recording captures very slow (infraslow) shifts; AC usually refers to mains power."],
    ],
  },
  {
    id: "montages",
    title: "Montages and electrode positions",
    blurb: "The 10-20 system and the way channels are linked.",
    rows: [
      ["10-20", "International 10-20 system", "Electrodes placed at 10% and 20% of measured skull distances, so placement scales to any head."],
      ["10-10", "Extended 10-10 system", "Adds positions between the 10-20 sites; renames T3/T4/T5/T6 as T7/T8/P7/P8."],
      ["Fp, F, C, T, P, O", "Frontopolar, frontal, central, temporal, parietal, occipital", "The region each electrode sits over. Odd numbers are left, even numbers right."],
      ["z (Fz, Cz, Pz)", "Zero, the midline", "Midline electrodes. Cz is the vertex, the centre point of the measurements."],
      ["A1 / A2", "Auricular (ear) electrodes, left / right", "Common reference sites; easily contaminated by temporal activity and ECG."],
      ["M1 / M2", "Mastoid electrodes, left / right", "Alternative reference sites behind the ears; used in sleep montages."],
      ["T1 / T2", "Anterior temporal electrodes", "Added to record from the anterior and mesial temporal lobe; common in epilepsy studies."],
      ["Sp / Pg", "Sphenoidal / nasopharyngeal electrodes", "Special electrodes closer to the mesial temporal lobe; rarely used now."],
      ["LB / AP", "Longitudinal bipolar (anterior-posterior), the double banana", "Chains front-to-back; localise by phase reversal. The standard first montage."],
      ["TB / TR", "Transverse bipolar", "Chains left-to-right across the head; useful for midline and parasagittal activity."],
      ["Referential", "Referential montage", "Each electrode against a common reference (Ref); localise by the highest amplitude."],
      ["CAR / Avg", "Common average reference", "Reference is the average of all electrodes; distorted when one area has very high voltage."],
      ["Lap", "Laplacian (source) derivation", "Each electrode against a weighted average of its neighbours; sharpens focal activity."],
      ["Nz / Iz", "Nasion / inion", "Landmarks for the front-to-back measurement (bridge of the nose and the bump at the back of the skull)."],
      ["LPA / RPA", "Left / right preauricular points", "Landmarks just in front of the ears for the side-to-side measurement."],
      ["HC / OFC", "Head circumference / occipitofrontal circumference", "Measured at the 10% line; used for neonatal and paediatric placement and charted as a growth measure."],
    ],
  },
  {
    id: "patterns",
    title: "EEG waveforms, patterns and normal variants",
    blurb: "Shorthand that appears in reports and teaching. ACNS ICU terms such as LPDs and GRDA are under ICU: EEG and monitoring terms.",
    rows: [
      ["IED", "Interictal epileptiform discharge", "Spikes or sharp waves between seizures; supports a diagnosis of epilepsy."],
      ["SW", "Spike-and-wave (or sharp-and-wave)", "A spike followed by a slow wave; 3 Hz generalized SW is the pattern of absence seizures."],
      ["GSW", "Generalized spike-and-wave", "Typical of genetic (idiopathic) generalized epilepsies."],
      ["PSW (EEG)", "Polyspike-and-wave", "Several spikes then a slow wave; typical of juvenile myoclonic epilepsy. In EMG, PSW means positive sharp wave."],
      ["SSW", "Slow spike-and-wave (under 2.5 Hz)", "Generalized pattern of Lennox-Gastaut syndrome."],
      ["GPFA", "Generalized paroxysmal fast activity", "Bursts of generalized beta-range activity, often with tonic seizures in Lennox-Gastaut syndrome."],
      ["PDA", "Polymorphic delta activity", "Irregular focal delta; suggests a structural lesion underneath."],
      ["FIRDA / OIRDA", "Frontal / occipital intermittent rhythmic delta activity", "Older terms; in ACNS terminology FIRDA is frontally predominant GRDA. OIRDA is seen in children, often with absence epilepsy."],
      ["TIRDA", "Temporal intermittent rhythmic delta activity", "Strongly associated with temporal lobe epilepsy; treated as epileptiform."],
      ["PLEDs / BIPLEDs / GPEDs", "Periodic lateralized / bilateral independent / generalized periodic epileptiform discharges", "Old names; now LPDs, BIPDs and GPDs (ACNS 2021)."],
      ["POSTS", "Positive occipital sharp transients of sleep", "Normal sleep transients: surface-positive sharp waves over the occipital leads, often in runs. Not epileptiform."],
      ["BETS / SSS", "Benign epileptiform transients of sleep / small sharp spikes", "Normal variant in adult drowsiness and light sleep; do not call it epileptiform."],
      ["RMTD", "Rhythmic midtemporal theta of drowsiness", "Normal variant (formerly the psychomotor variant); notched theta trains in drowsiness."],
      ["SREDA", "Subclinical rhythmic electrographic discharge of adults", "Rare benign variant in older adults that can look like a seizure; no clinical change."],
      ["14 & 6", "14 and 6 Hz positive spikes (bursts)", "Normal variant in adolescent sleep, posterior temporal; not epileptiform."],
      ["WHAM / FOLD", "6 Hz spike-and-wave: Wake, High amplitude, Anterior, Male / Female, Occipital, Low amplitude, Drowsy", "Memory aid for the phantom spike-and-wave; WHAM is more often linked to seizures, FOLD is usually benign."],
      ["V wave", "Vertex sharp wave", "Normal drowsiness and N1/N2 transient at Cz; can look sharp in children."],
      ["BS", "Burst suppression", "Alternating bursts and suppression; seen with deep anaesthesia, severe encephalopathy or after cardiac arrest."],
      ["TA / TD", "Tracé alternant / tracé discontinu", "Neonatal patterns: TA is normal quiet sleep near term; TD is the normal discontinuous pattern of preterm babies."],
      ["IBI", "Interburst interval", "Length of the quiet gaps in a discontinuous neonatal record; long IBIs for age are abnormal."],
      ["PMA / GA", "Postmenstrual age / gestational age", "PMA (gestational age plus age since birth) decides what is normal in a neonatal EEG. CA (conceptional age) is the older term."],
      ["PSWC", "Periodic sharp wave complexes", "About 1 per second generalized periodic complexes; classic in sporadic Creutzfeldt-Jakob disease."],
    ],
  },
  {
    id: "epilepsy",
    title: "Epilepsy, seizures and epilepsy surgery",
    blurb: "Seizure and syndrome names (ILAE), plus the workup you support in the epilepsy monitoring unit.",
    rows: [
      ["Sz", "Seizure", "Common chart shorthand, as in 'r/o sz' (rule out seizure)."],
      ["FAS / FIAS", "Focal aware seizure / focal impaired awareness seizure", "ILAE 2017 terms; replaced simple partial (SPS) and complex partial (CPS) seizures."],
      ["SPS / CPS", "Simple partial / complex partial seizure", "Older terms you will still see on orders."],
      ["GTC / FBTC", "Generalized tonic-clonic / focal to bilateral tonic-clonic seizure", "FBTC replaced 'secondarily generalized'; the onset (focal or generalized) matters for treatment and surgery."],
      ["CAE / JAE", "Childhood / juvenile absence epilepsy", "3 Hz generalized spike-and-wave, often brought out by hyperventilation."],
      ["JME", "Juvenile myoclonic epilepsy", "Generalized polyspike-and-wave, often photosensitive; morning myoclonic jerks."],
      ["SeLECTS / BECTS", "Self-limited epilepsy with centrotemporal spikes / the older name, benign epilepsy with centrotemporal spikes", "Centrotemporal spikes that increase in sleep; the most common childhood focal epilepsy."],
      ["LGS", "Lennox-Gastaut syndrome", "Slow spike-and-wave, GPFA in sleep, several seizure types including tonic."],
      ["IESS / IS", "Infantile epileptic spasms syndrome / infantile spasms (West syndrome)", "Hypsarrhythmia between spasms; an urgent diagnosis, so report it promptly."],
      ["EE-SWAS / ESES / CSWS", "Epileptic encephalopathy with spike-wave activation in sleep / electrical status epilepticus in sleep / continuous spike-wave in sleep", "Spike-wave becomes nearly continuous in NREM sleep; needs a sleep recording to diagnose."],
      ["DEE", "Developmental and epileptic encephalopathy", "Severe early-onset epilepsies where both the genetic cause and the seizures affect development."],
      ["TLE / MTLE", "(Mesial) temporal lobe epilepsy", "The most common focal epilepsy in adults; often hippocampal sclerosis."],
      ["PNES / FS", "Psychogenic nonepileptic seizures / functional seizures", "Events without an EEG seizure correlate; video-EEG capture of a typical event is the gold standard."],
      ["SUDEP", "Sudden unexpected death in epilepsy", "The reason the EMU monitors closely during and after generalized seizures."],
      ["EMU", "Epilepsy monitoring unit", "Video-EEG admission to capture and classify events; you test and document responsiveness during seizures."],
      ["iEEG", "Intracranial EEG", "Recording from electrodes inside the skull for surgical planning."],
      ["SEEG / sEEG", "Stereo-EEG (depth electrodes)", "Depth electrodes placed through small drill holes to sample deep and widespread sites."],
      ["ECoG", "Electrocorticography", "Recording directly from the brain surface with grid or strip electrodes, during or after surgery."],
      ["Wada / IAP", "Intracarotid amobarbital (or methohexital) procedure", "One hemisphere is briefly put to sleep to test language and memory before surgery; EEG confirms the effect."],
      ["MEG / MSI", "Magnetoencephalography / magnetic source imaging", "Records the magnetic fields of brain activity to localise spikes for surgery."],
      ["SPECT / PET", "Single-photon emission CT / positron emission tomography", "Ictal SPECT shows increased blood flow at the onset; interictal PET shows reduced metabolism."],
      ["ATL / LITT", "Anterior temporal lobectomy / laser interstitial thermal therapy", "Epilepsy surgery options; LITT ablates tissue through a small probe."],
      ["VNS", "Vagus nerve stimulator", "Implanted device in the neck and chest; can cause periodic artifact and voice change when it fires."],
      ["RNS (epilepsy)", "Responsive neurostimulation", "Implanted device that records ECoG and stimulates when it detects seizures. In the EMG lab, RNS means repetitive nerve stimulation."],
      ["DBS", "Deep brain stimulation", "Implanted brain stimulator (epilepsy, Parkinson's disease); a source of artifact."],
      ["KD", "Ketogenic diet", "High-fat diet for drug-resistant epilepsy; can change the EEG over time."],
    ],
  },
  {
    id: "medications",
    title: "Seizure and sedation medications",
    blurb: "Common shorthand for antiseizure and sedating drugs. ICU infusions are under ICU: Drugs, orders, timing and chart shorthand.",
    rows: [
      ["BZD / benzo", "Benzodiazepines", "Increase beta activity and can suppress epileptiform discharges; note recent doses."],
      ["LZP / LOR, DZP, MDZ", "Lorazepam, diazepam, midazolam", "First-line rescue benzodiazepines for status epilepticus; cause beta and drowsiness on the EEG."],
      ["CLB / CZP", "Clobazam / clonazepam", "Oral benzodiazepines used long term; increase beta activity."],
      ["PB", "Phenobarbital", "Barbiturate; first-line for neonatal seizures. Increases beta and can slow the background."],
      ["PHT", "Phenytoin (fosphenytoin, fosPHT, is its IV form)", "Sodium-channel ASM; toxic levels slow the background and cause ataxia."],
      ["CBZ / OXC", "Carbamazepine / oxcarbazepine", "Sodium-channel ASMs for focal seizures; can worsen absence and myoclonic seizures; OXC can lower sodium."],
      ["BRV", "Brivaracetam", "Broad-spectrum ASM related to levetiracetam (LEV); little effect on the background."],
      ["LTG", "Lamotrigine", "Broad-spectrum ASM; can worsen myoclonic seizures in some patients."],
      ["TPM / ZNS", "Topiramate / zonisamide", "Broad-spectrum ASMs; can cause word-finding problems and kidney stones."],
      ["ESM", "Ethosuximide", "First choice for childhood absence epilepsy."],
      ["VGB / ACTH", "Vigabatrin / adrenocorticotropic hormone", "First-line treatments for infantile spasms; vigabatrin especially with tuberous sclerosis."],
      ["PER / CNB", "Perampanel / cenobamate", "Newer ASMs for drug-resistant focal epilepsy."],
      ["GBP / PGB", "Gabapentin / pregabalin", "Used for seizures and nerve pain; can cause drowsiness."],
      ["Chloral / melatonin", "Chloral hydrate / melatonin", "Used to help children sleep for the EEG; chloral increases beta activity."],
    ],
  },
  {
    id: "evoked",
    title: "Evoked potentials",
    blurb: "Visual, auditory and somatosensory testing. Peaks are named by polarity and typical latency in milliseconds (N20 is a negative peak near 20 ms).",
    rows: [
      ["EP", "Evoked potential", "A response time-locked to a stimulus, pulled out of the background by averaging many trials."],
      ["VEP / PRVEP", "Visual evoked potential / pattern-reversal VEP", "Checkerboard reversal; measure the P100 latency. Check visual acuity and fixation first."],
      ["FVEP", "Flash VEP", "Used when the patient cannot fixate (infants, ICU); more variable than pattern reversal."],
      ["P100", "Positive peak near 100 ms (VEP)", "A delayed P100 suggests slowed conduction in the visual pathway, such as optic neuritis."],
      ["BAEP / BAER / ABR", "Brainstem auditory evoked potential / response, auditory brainstem response", "Clicks to each ear; waves I to V test the auditory nerve and brainstem."],
      ["Waves I, III, V", "BAEP peaks", "I: distal auditory nerve; III: lower pons (cochlear nucleus, superior olive); V: lateral lemniscus to inferior colliculus."],
      ["IPL", "Interpeak latency", "I-III, III-V and I-V intervals; prolonged IPLs localise a brainstem conduction problem."],
      ["dB nHL / SPL", "Decibels normal hearing level / sound pressure level", "Click intensity; check that the patient can hear before testing."],
      ["SSEP / SEP", "Somatosensory evoked potential", "Median or tibial nerve stimulation; tests the dorsal column-medial lemniscus pathway."],
      ["N9 / N13 / N20", "Median SSEP peaks: Erb's point / cervical / cortical", "Track the volley from brachial plexus to neck to cortex; absent N20s after cardiac arrest predict a poor outcome."],
      ["P37 (P40)", "Tibial SSEP cortical peak", "The cortical response to posterior tibial nerve stimulation, recorded near Cz."],
      ["CCT", "Central conduction time (N13 to N20)", "Isolates conduction inside the brainstem and brain from the peripheral nerve."],
      ["ERP / P300", "Event-related potential / the P300 peak", "Cognitive potential to an 'oddball' stimulus; mainly a research tool."],
    ],
  },
  {
    id: "ncs",
    title: "Nerve conduction and EMG",
    blurb: "Electrodiagnostic (EDX) lab shorthand. In ICU charts NCS usually means nonconvulsive seizure, not nerve conduction study.",
    rows: [
      ["EDX", "Electrodiagnostic testing", "Umbrella term for nerve conduction studies and needle EMG."],
      ["NCS (EDX)", "Nerve conduction study", "Stimulate a nerve and record the response; tests speed and size of the signal."],
      ["NCV / CV", "Nerve conduction velocity / conduction velocity", "Speed in m/s; slowed conduction suggests demyelination."],
      ["CMAP", "Compound muscle action potential", "Motor response recorded over a muscle; low amplitude suggests axon loss."],
      ["SNAP", "Sensory nerve action potential", "Sensory response; small and easily lost, sensitive to temperature and electrode placement."],
      ["DL", "Distal latency", "Time from stimulus at the distal site to response, in ms; prolonged in carpal tunnel syndrome."],
      ["F wave", "F wave (late response)", "Small late motor response from motor neurons fired backward; tests proximal nerve segments and roots."],
      ["H reflex", "Hoffmann reflex", "Electrical version of the ankle reflex (S1 root); absent or delayed in S1 radiculopathy."],
      ["MUAP / MUP", "Motor unit action potential", "Needle EMG unit; long, large units suggest chronic nerve damage, small short units suggest myopathy."],
      ["Fibs / PSW (EMG)", "Fibrillation potentials / positive sharp waves", "Spontaneous activity at rest that signals active denervation."],
      ["CRD", "Complex repetitive discharge", "Abnormal spontaneous discharge with an abrupt start and stop; seen in chronic nerve and muscle disease."],
      ["RNS (EMG)", "Repetitive nerve stimulation", "Trains of stimuli; a decrement over 10% at 2 to 3 Hz suggests myasthenia gravis."],
      ["SFEMG", "Single-fibre EMG", "Measures jitter at the neuromuscular junction; very sensitive for myasthenia."],
      ["Limb temp", "Limb temperature", "Cold limbs slow conduction and raise amplitudes; many labs warm hands to at least 32 °C and feet to at least 30 °C."],
      ["CTS", "Carpal tunnel syndrome", "Median nerve compression at the wrist; the most common EDX referral."],
      ["GBS / AIDP", "Guillain-Barré syndrome / acute inflammatory demyelinating polyneuropathy", "Acute ascending weakness; early studies may show only abnormal F waves."],
      ["CIDP", "Chronic inflammatory demyelinating polyneuropathy", "Chronic demyelinating neuropathy; slowed conduction and conduction block."],
      ["ALS / MND", "Amyotrophic lateral sclerosis / motor neuron disease", "Widespread denervation and reinnervation with normal sensory responses."],
      ["MG / LEMS", "Myasthenia gravis / Lambert-Eaton myasthenic syndrome", "Neuromuscular junction disorders: MG decrements at slow rates; LEMS increments after exercise or fast stimulation."],
      ["CIP / CIM", "Critical illness polyneuropathy / myopathy", "Weakness acquired in the ICU; a common reason for bedside EDX."],
    ],
  },
  {
    id: "ionm",
    title: "Intraoperative monitoring",
    blurb: "Terms from the operating room, where you monitor nervous-system function during surgery.",
    rows: [
      ["IONM / IOM", "Intraoperative neurophysiological monitoring", "Live EEG, EPs and EMG during surgery to warn the surgeon of injury in time to act."],
      ["TcMEP / MEP", "Transcranial motor evoked potential", "Scalp stimulation, muscle recording; tests the motor tracts. Needs bite blocks and very little neuromuscular blockade."],
      ["D wave", "Direct wave", "Corticospinal volley recorded from the spinal cord; not affected by neuromuscular blockade."],
      ["s-EMG / t-EMG", "Spontaneous (free-run) EMG / triggered EMG", "Free-run EMG shows nerve irritation; triggered EMG tests pedicle screws, where a low threshold suggests a breach."],
      ["TOF", "Train of four", "Four stimuli to gauge neuromuscular blockade. Paralytics abolish MEPs and EMG but not SSEPs or EEG, so enough twitches must be present."],
      ["MAC", "Minimum alveolar concentration", "Dose of inhaled anaesthetic; higher MAC depresses cortical SSEPs and MEPs, so it is usually kept low."],
      ["TIVA", "Total intravenous anaesthesia", "Propofol-based anaesthesia without inhaled agents; preferred when MEPs are monitored."],
      ["BIS", "Bispectral index", "Processed-EEG number (0 to 100) for depth of anaesthesia."],
      ["CEA", "Carotid endarterectomy", "EEG (with or without SSEPs) watches for ischaemia when the carotid is clamped."],
      ["CPA / MVD", "Cerebellopontine angle surgery / microvascular decompression", "Cases where BAEPs and facial-nerve EMG protect hearing and the facial nerve."],
    ],
  },
  {
    id: "sleep",
    title: "Sleep studies",
    blurb: "Polysomnography terms (AASM scoring). In ICU monitoring CSA means compressed spectral array; here it is central sleep apnea.",
    rows: [
      ["PSG", "Polysomnogram", "Overnight study recording EEG, EOG, chin EMG, airflow, effort, oxygen, ECG and leg movements."],
      ["W, N1, N2, N3, R", "AASM sleep stages: wake, NREM 1 to 3, REM", "Scored in 30-second epochs; N3 is slow-wave sleep, R is REM."],
      ["REM / NREM", "Rapid eye movement / non-REM sleep", "REM has rapid eye movements, low chin tone and a low-voltage mixed EEG."],
      ["MSLT", "Multiple sleep latency test", "Four or five naps two hours apart the day after a PSG; tests sleepiness and narcolepsy."],
      ["MWT", "Maintenance of wakefulness test", "Tests the ability to stay awake, such as for driving safety."],
      ["SOREMP", "Sleep-onset REM period", "REM within 15 minutes of sleep onset; two or more on the MSLT support narcolepsy."],
      ["OSA / CSA (sleep)", "Obstructive / central sleep apnea", "Obstructive: effort continues but airflow stops. Central: effort and airflow both stop."],
      ["AHI / RDI", "Apnea-hypopnea index / respiratory disturbance index", "Events per hour of sleep; AHI 5 to 14 is mild, 15 to 29 moderate, 30 or more severe."],
      ["ODI", "Oxygen desaturation index", "Desaturations per hour of sleep."],
      ["CPAP / BPAP", "Continuous / bilevel positive airway pressure", "Treatment for sleep apnea; a titration study finds the right pressure."],
      ["PLMS / RLS", "Periodic limb movements of sleep / restless legs syndrome", "Leg EMG shows repeated kicks every 5 to 90 seconds in PLMS; RLS is diagnosed from the history."],
      ["RBD", "REM sleep behaviour disorder", "REM without the normal loss of muscle tone, with dream enactment."],
      ["TST / SE (sleep)", "Total sleep time / sleep efficiency", "SE is total sleep time divided by time in bed. In ICU charts SE means status epilepticus."],
      ["SL / WASO", "Sleep latency / wake after sleep onset", "Time to fall asleep / minutes awake after first falling asleep."],
    ],
  },
  {
    id: "orgs",
    title: "Organizations, credentials and safety",
    blurb: "Who writes the standards, what the credentials are, and the safety and privacy rules you work under.",
    rows: [
      ["ABRET", "ABRET Neurodiagnostic Credentialing and Accreditation", "Awards the R. EEG T., R. EP T., CNIM, CLTM and other credentials; accredits labs."],
      ["R. EP T.", "Registered Evoked Potential Technologist", "ABRET credential for evoked potentials."],
      ["CNIM", "Certification in Neurophysiologic Intraoperative Monitoring", "ABRET credential for IONM."],
      ["CLTM", "Certified Long Term Monitoring", "ABRET credential for EMU and ICU long-term monitoring."],
      ["R. NCS T. / CNCT", "Registered Nerve Conduction Studies Technologist (ABRET) / Certified Nerve Conduction Technologist (AAET)", "Credentials for nerve conduction work."],
      ["RPSGT", "Registered Polysomnographic Technologist", "Sleep credential from the BRPT."],
      ["CEU", "Continuing education unit", "Needed to keep credentials current."],
      ["ASET", "ASET - The Neurodiagnostic Society", "The technologists' professional society; publishes national competency skills and education."],
      ["ACNS", "American Clinical Neurophysiology Society", "Writes the EEG guidelines and the critical care EEG terminology."],
      ["AAN / AES", "American Academy of Neurology / American Epilepsy Society", "Neurology and epilepsy professional bodies; publish practice guidelines."],
      ["ILAE / IFCN", "International League Against Epilepsy / International Federation of Clinical Neurophysiology", "International bodies for seizure classification and neurophysiology standards (including the 10-10 system)."],
      ["AANEM", "American Association of Neuromuscular & Electrodiagnostic Medicine", "Sets EDX (NCS/EMG) practice standards."],
      ["AASM", "American Academy of Sleep Medicine", "Publishes the sleep scoring manual and accredits sleep centres."],
      ["TJC", "The Joint Commission", "Hospital accreditation; patient identification and safety standards."],
      ["HIPAA / PHI", "Health Insurance Portability and Accountability Act / protected health information", "Keep patient details private; never share recordings or screenshots that identify a patient."],
      ["OSHA", "Occupational Safety and Health Administration", "Workplace safety rules, including bloodborne pathogens and chemical handling."],
      ["SDS", "Safety data sheet (formerly MSDS)", "Hazard information for chemicals such as collodion and acetone."],
      ["PPE", "Personal protective equipment", "Gloves, gowns, masks and eye protection chosen for the isolation type."],
      ["CJD", "Creutzfeldt-Jakob disease", "Prion disease needing special infection control: disposable electrodes and strict cleaning."],
    ],
  },
  {
    id: "general",
    title: "General medical and chart shorthand",
    blurb: "Everyday terms on requisitions and in charts. More ICU chart shorthand (s/p, POD, r/o, PRN) is under ICU: Drugs, orders, timing and chart shorthand.",
    rows: [
      ["y/o", "Years old", "Age decides what is normal on an EEG; always confirm it."],
      ["CC / HPI", "Chief complaint / history of present illness", "Why the test was ordered; tells you what event to look for."],
      ["PMH / PSH", "Past medical / past surgical history", "Look for prior strokes, tumours or skull surgery (a breach rhythm is expected over a skull defect)."],
      ["FHx / SHx", "Family history / social history", "Family epilepsy or substance use can matter for the study."],
      ["LOC", "Loss of consciousness, or level of consciousness", "Ambiguous: read it in context or ask."],
      ["A&O×3 / ×4", "Alert and oriented to person, place, time (and situation)", "A quick bedside mental-status check you can document before and after events."],
      ["PERRLA", "Pupils equal, round, reactive to light and accommodation", "Normal pupil exam; abnormal pupils change the urgency of a finding."],
      ["CN", "Cranial nerves", "Cranial nerve exam; CN II, VIII and VII relate to VEPs, BAEPs and facial-nerve monitoring."],
      ["UMN / LMN", "Upper / lower motor neuron", "Brain-and-cord versus nerve-and-root weakness; shapes the EDX plan."],
      ["CNS / PNS", "Central / peripheral nervous system", "EEG tests the CNS; NCS/EMG mostly tests the PNS."],
      ["CSF", "Cerebrospinal fluid", "Fluid around the brain; sampled by LP, drained by an EVD."],
      ["DTR", "Deep tendon reflexes", "Reflex exam; brisk in UMN problems, reduced in neuropathy."],
      ["WNL / NAD", "Within normal limits / no acute distress", "Common normal findings in notes."],
      ["d/c", "Discharge or discontinue", "Ambiguous: 'd/c EEG' could mean stop the study or the patient is leaving. Clarify."],
      ["f/u", "Follow-up", "Repeat study or clinic visit planned."],
      ["BP / HR / RR", "Blood pressure / heart rate / respiratory rate", "Vital signs; note big changes during events."],
      ["SpO2", "Peripheral oxygen saturation", "Watch during hyperventilation and seizures; low oxygen slows the EEG."],
      ["Glu / BG", "Glucose / blood glucose", "Low glucose causes slowing and seizures; check it before blaming the brain."],
      ["Na", "Sodium", "Low sodium can cause encephalopathy and seizures."],
      ["NH3", "Ammonia", "High in liver failure and with valproate; linked to triphasic-morphology discharges."],
      ["BUN / Cr", "Blood urea nitrogen / creatinine", "Kidney function; uremia causes encephalopathy and affects drug levels."],
      ["CBC / BMP / CMP", "Complete blood count / basic and comprehensive metabolic panels", "Routine blood tests for infection and metabolic causes of encephalopathy."],
      ["ABG", "Arterial blood gas", "Oxygen, carbon dioxide and acidity; low CO2 (as in hyperventilation) slows the EEG."],
      ["EtOH / UDS", "Alcohol / urine drug screen", "Intoxication and withdrawal affect the EEG and seizure risk."],
      ["HTN / DM", "Hypertension / diabetes mellitus", "Common conditions; DM raises the chance of glucose problems during the study."],
      ["AFib / CHF / CAD", "Atrial fibrillation / congestive heart failure / coronary artery disease", "Heart disease raises stroke risk; may be a reason to skip hyperventilation."],
      ["MS", "Multiple sclerosis (also morphine sulfate, mental status)", "Ambiguous: in EP labs it usually means multiple sclerosis; on drug charts it can mean morphine."],
      ["PD / AD", "Parkinson's disease / Alzheimer's disease", "PD tremor causes rhythmic artifact; AD is linked to background slowing."],
      ["CP / GDD / ASD", "Cerebral palsy / global developmental delay / autism spectrum disorder", "Plan for cooperation and sensory needs during setup."],
      ["TSC / NF1", "Tuberous sclerosis complex / neurofibromatosis type 1", "Genetic conditions with high epilepsy risk (TSC especially, with infantile spasms)."],
    ],
  },
];

// The ICU & cEEG page's abbreviation tables, read from its data file.
const icuTab = (icuEeg.tabs || []).find((t) => t.id === "abbreviations");
const ICU_GROUPS = (icuTab?.sections || [])
  .filter((s) => s.kind === "table" && Array.isArray(s.rows))
  .map((s, i) => ({
    id: `icu-${i + 1}`,
    title: `ICU: ${s.title}`,
    blurb: "From the ICU & cEEG page.",
    source: { label: "ICU & cEEG", to: "/icu-eeg" },
    rows: s.rows,
  }));

export const ABBREVIATION_GROUPS = [...ICU_GROUPS, ...LAB_GROUPS];

/** Flat list of every entry with its group, for search. */
export const ABBREVIATIONS = ABBREVIATION_GROUPS.flatMap((g) =>
  g.rows.map(([abbr, meaning, why]) => ({ abbr, meaning, why, groupId: g.id, groupTitle: g.title })),
);

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Entries matching a query in the abbreviation, meaning or note. Abbreviation matches sort first. */
export function searchAbbreviations(query, entries = ABBREVIATIONS) {
  const q = norm(query || "");
  if (!q) return entries;
  const score = (e) => {
    const a = norm(e.abbr);
    const tokens = a.split(/\s*[/,]\s*|\s+/);
    if (tokens.includes(q) || a === q) return 0;
    if (a.includes(q)) return 1;
    if (norm(e.meaning).includes(q)) return 2;
    if (norm(e.why).includes(q)) return 3;
    return -1;
  };
  return entries
    .map((e) => [e, score(e)])
    .filter(([, s]) => s >= 0)
    .sort((x, y) => x[1] - y[1])
    .map(([e]) => e);
}

/**
 * Letter-for-letter collisions: the same token (e.g. NCS, CSA, SE, RNS, PSW)
 * listed in more than one group with a different meaning. Tokens come from the
 * abbreviation split on "/" and "," with any "(context)" note removed.
 */
export function ambiguousAbbreviations(entries = ABBREVIATIONS) {
  const byToken = new Map();
  for (const e of entries) {
    const tokens = e.abbr
      .replace(/\([^)]*\)/g, "")
      .split(/[/,]/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
    for (const t of tokens) {
      const key = t.toUpperCase();
      if (!byToken.has(key)) byToken.set(key, []);
      byToken.get(key).push(e);
    }
  }
  return [...byToken.entries()]
    .filter(([, list]) => new Set(list.map((e) => e.groupId)).size > 1 && new Set(list.map((e) => e.meaning)).size > 1)
    .map(([token, list]) => ({ token, entries: list }))
    .sort((a, b) => a.token.localeCompare(b.token));
}

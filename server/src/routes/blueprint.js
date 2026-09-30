import express from 'express';
import { getBlueprint, allocateByBlueprint } from '../blueprint/abret2026.js';

// Public, read-only view of the canonical exam blueprint.
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        ...getBlueprint(),
        sampleAllocations: {
            130: allocateByBlueprint(130),
            30: allocateByBlueprint(30),
        },
    });
});

export default router;

/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
*/
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
loadSync({ export: true });

console.log('------------------------------------------------------------------------\n');
console.log('Starting Deno server...\n');
console.log('Printing env vars ...\n');

const env = Deno.env.toObject();
for (const k in env) {
    if (k.startsWith("APG_")) {
        console.log(`  ${k}=${env[k]}`);
    }
}

import {Mng} from "./mod.ts";
import {Spc} from "./test/deps.ts";
import {ApgMng_Spec} from "./test/specs/ApgMng_Spec.ts";


// Remote test result browser service address 
const RESULTS_BROWSER_URI = "https://apg-tst.deno.dev/store";

// Current framework or library under test
const FRAMEWORK = "ApgMng";



async function ApgMng_Suite(arun: Spc.ApgSpc_eRun) {

    if (arun != Spc.ApgSpc_eRun.yes) return;

    const Local_Db_Spec = new ApgMng_Spec(Mng.ApgMng_eMode.local);

    if (await Local_Db_Spec.Run(Spc.ApgSpc_eRun.yes)) {
        const r = await Local_Db_Spec.SendEventsToTestService(
            RESULTS_BROWSER_URI,
            FRAMEWORK,
            Local_Db_Spec.NAME
        );
        if (r) Spc.ApgSpc_Service.ClearEvents();
    }


    const Atlas_Db_Spec = new ApgMng_Spec(Mng.ApgMng_eMode.atlas);

    if (await Atlas_Db_Spec.Run(Spc.ApgSpc_eRun.yes)) {
        const r = await Atlas_Db_Spec.SendEventsToTestService(
            RESULTS_BROWSER_URI,
            FRAMEWORK,
            Atlas_Db_Spec.NAME
        );
        if (r) Spc.ApgSpc_Service.ClearEvents();
    }

    Spc.ApgSpc_Service.FinalReport();
}


await ApgMng_Suite(Spc.ApgSpc_eRun.yes);


/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
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

import { Mng } from "./mod.ts";
import { Spc } from "./test/deps.ts";
import { Specs } from "./specs.ts";


// Todo This is deprecated sooner or later remove it --APG 20241224
// Remote test result browser service address 
const RESULTS_BROWSER_URI = "https://apg-tst.deno.dev/store";

// Current framework or library under test
const FRAMEWORK = "ApgMng";



async function ApgMng_Suite(arun: Spc.ApgSpc_eRun) {

    if (arun != Spc.ApgSpc_eRun.yes) return;

    const results: Spc.ApgSpc_TSpecResult[] = [];


    const Local_Db_Spec = new Specs.ApgMng_Spec(Mng.ApgMng_eMode.local);
    const r1 = await Local_Db_Spec.Run(Spc.ApgSpc_eRun.yes)

    if (r1) {

        results.push(Spc.ApgSpc_Service.Result());

        const r = await Local_Db_Spec.SendEventsToTestService(
            RESULTS_BROWSER_URI,
            FRAMEWORK,
            Local_Db_Spec.NAME
        );

        Spc.ApgSpc_Service.Reset();
    }


    const Atlas_Db_Spec = new Specs.ApgMng_Spec(Mng.ApgMng_eMode.atlas);
    const r2 = await Atlas_Db_Spec.Run(Spc.ApgSpc_eRun.yes)

    if (r2) {

        results.push(Spc.ApgSpc_Service.Result());

        const r = await Atlas_Db_Spec.SendEventsToTestService(
            RESULTS_BROWSER_URI,
            FRAMEWORK,
            Atlas_Db_Spec.NAME
        );

        Spc.ApgSpc_Service.Reset();
    }

    Spc.ApgSpc_Service.FinalReport(results);

}



// Run the test suite
await ApgMng_Suite(Spc.ApgSpc_eRun.yes);


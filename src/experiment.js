/**
 * @title CPT3
 * @description A experiment used to measure different dimensions of sustained attention. Created for a class assesment in "perception and attention".
 * @version 1.0.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

import { exp_list, randomID } from "./helper.ts";
import { initJsPsych } from "jspsych";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {

  // Jatos run?
  const jatos_run = window.jatos !== undefined || false;

  // Practice and experiment trial list

  const practice = exp_list.slice(0, 20);
  const experiment = exp_list.slice(20, exp_list.length);

  // Creating random ID for each participant
  const ID = randomID();
  
  const jsPsych = initJsPsych({
    on_finish: () => {
      if (jatos_run) {
        jatos.submitResultData(jsPsych.data.get().filter({trial_type: "html-keyboard-response"}).json())
          .then(() => {
            console.log("Success")
            jatos.endStudy();
          })
          .catch(() => console.log("Problem submitting the data to the server"));
      }
    },
  });

  jsPsych.data.addProperties({ID: ID});

  // Collecting trial number and recording the last block when data were append to jatos
  let [Trial_num, last_block_update] = [0, 0];

  // Function to gather critical information on each trial
  const processData = () => {
    let data = {
      condition: (jsPsych.timelineVariable('stimulus') == 'X')? 'distractor': 'target',
      ISI: jsPsych.timelineVariable('ISI'),
      correct_response: jsPsych.timelineVariable('correct_response'),
      Block: jsPsych.timelineVariable('Block'),
      Trial_num: ++Trial_num,
      Phase: (jsPsych.timelineVariable("Block") > 0)? "CPT": "Practice",
    };
    console.log(data.Phase)
    return data;
  }

  // Function to process responses and send data to jatos periodically
  const finish_trial = (data) => {
    data.response = (data.response == " ") ? "Space":"Absent";
    data.correct_response = (jsPsych.timelineVariable("correct_response") == " ") ? "Space":"Absent";
    data.correct = (jsPsych.pluginAPI.compareKeys(data.response, data.correct_response))? 1: 0;

    
    // Update data every three blocks (except the first iteration, that records the practice block only)
    if (data.Block % 3 == 0 && data.Trial_num == 20*data.Block+20 && jatos_run) {

      // Custom filter
      let to_send = jsPsych.data.get().filterCustom((trial) => {
          return trial.trial_type == "html-keyboard-response" && (trial.Block >= last_block_update && trial.Block <= data.Block);
        }).json()
      
        // To collpase trial in each appending
        if (data.Block == 0) {
          to_send = to_send.replace("]", "");
        } else if (data.Block == 18) {
          to_send = to_send.replace("[", "");
        } else {
          to_send = to_send.replace(/[\[[\]]/g, "");
        }

      console.log(to_send);
      jatos.appendResultData(to_send)
        .then(() => {
          last_block_update = data.Block + 1;
          console.log(`Data succesfully uploaded to the server; Block: ${data.Block}`)
        })
        .catch(() => console.log(`Problem uploading data at block ${data.Block}`))
    }
  };

  const timeline = [];  

  // Practice instructions
  const inst_prac = {
    type: HtmlButtonResponsePlugin,
    stimulus: `
    <div style: 'width: 1000px;'>
    <p>¡Bienvenida/o a la parte práctica del test CPT!</p></br>
    <p>Durante esta tarea irán apareciendo una sucesión de letras en el centro de la pantalla.</p></br>
    <p>Tu tarea consistirá en presionar la <strong>BARRA ESPACIADORA</strong> para todas las letras que vayan apareciendo, excepto para la letra X.</p>
    </br>
    <p>Antes de comenzar vamos a realizar unos cuantos ensayos de práctica para que te familiarices con la tarea.</p>
    </br>
    </div>
    `,
    choices: ["Empezar práctica"],
    post_trial_gap: 2000,
    on_finish: () => {
      document.body.style.cursor = 'none';
    }
  };


  // Switch to fullscreen

   const full_on = {
    type: FullscreenPlugin,
    fullscreen_mode: true,
    message: "<p>Antes de empezar, pulsa el botón para entrar en modo pantalla completa.</p>",
    button_label: "Entrar en pantalla completa",
  }

  const full_off = {
    type: FullscreenPlugin,
    fullscreen_mode: false,
  }


  const inst_exp = {
    type: HtmlButtonResponsePlugin,
    stimulus: `
    <div style: 'width: 1000px;'>
      <p> Ahora que ya te has familiarizado con la tarea vamos a empezar.</p>
      </br>
      <p>Antes de empezar, recuerda: </br></br> Presiona la <strong>BARRA ESPACIADORA</strong>
       para todas las letras que aparezcan, excepto si aparece la letra X.</p>
      </br>
      <p> Presiona el boton cuando quieras empezar.</p>
    </div>
    `,
    choices: ["Empezar tarea"],
    post_trial_gap: 2000,
    on_load: function() {
      document.body.style.cursor = 'auto';
    },
    on_finish: function() {
      document.body.style.cursor = 'none';
    },
  };

  const test = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: [' '],
    data: processData,
    stimulus_duration: 250,
    trial_duration: 1250,
    response_ends_trial: false,
    on_finish: finish_trial,
    post_trial_gap: function () {
      return jsPsych.timelineVariable('ISI') - 1000;
    },
    css_classes: ['stimulus']
  };

  const practice_procedure = {
    timeline: [test],
    timeline_variables: practice,
    repetitions: 1,
    randomize_order: false
  };

  const experiment_procedure = {
    timeline: [test],
    timeline_variables: experiment,
    repetitions: 1,
    randomize_order: false,
  };

  /* This is a possible example in how to show the data in a table at the end of the experiment*/
  // const debrief = {
  //   stimulus: 'asda',
  //   type: HtmlButtonResponsePlugin,
  //   prompt: "Ya has terminadoo el experimento, pulsa el botón para descargar los datos.",
  //   choices: ["Descargar"],
  //   on_load: function() {
  //     const page = document.querySelector(".jspsych-content-wrapper");
  //     let div = document.createElement('div');
  //     div.classList.add('table-container')  
  //     document.body.style.cursor = 'auto';
  //     let csv = jsPsych.data.get().filter([{Phase: 'Practice'}, {Phase: 'CPT'}]).csv();
  //     let table = show_results(csv);
  //     div.appendChild(table)
  //     page.appendChild(div);
  //   }
  // }

  const end = {
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      return `
      <p>¡Ya has terminado la tarea!</p></br>
      <p>Antes de terminar, recuerda apuntar tu identificador: ${ID}</p></br>
      <p>Pulsa el boton para terminar el experimento</p>
      `
    },
    choices: ['Terminar'],
    on_load: () => {
      document.body.style.cursor = 'auto';
    },
  }

  // Pushing each part of the experiment into the timeline
  timeline.push(full_on, inst_prac, practice_procedure, inst_exp, experiment_procedure, full_off, end);

  
  // Run experiment
  await jsPsych.run(timeline);

}

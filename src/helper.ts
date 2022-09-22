// Experimental stimuli
const letters = {
    target: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","Z"],
    distractor: "X",
}

// Useful functions:
const randomIndex = (min = 0, max= letters.target.length -1, no?: number[]) => {
    let ind = Math.floor(Math.random()* (max - min + 1) + min);
    if (no) {
        while(no.indexOf(ind) >= 0) {
            ind = Math.floor(Math.random()* (max - min + 1) + min);
        }
    }
    return ind;
};

export const randomID = (num: number = 5, lett: number = 2) => {
    let ID = '';
    let tmp: string;
    const letter = letters.target;
    letter.push("X")
    for (let  i = 0; i < num; i++) {
      tmp = randomIndex(0, 9).toString();
      ID += tmp;
    }
    for (let i = 0; i < lett; i++) {
        tmp = letter[randomIndex(0, letter.length - 1)];
        ID += tmp
    }
    return ID;
  };

const shuffleISI = () => {
    let arr: number[] = []; let indexes: number[] = [];
    for (let i = 0; i < 6; i ++) {
        indexes = [];
        for (let j = 0; j < 3; j++) {
            indexes.push(randomIndex(0, 2, indexes));
            let tmp = [1000, 2000, 4000][indexes[j]];
            arr.push(tmp)
        }
    }
    return arr;
};


const asignDistractor = (Block: number) => {
 let scope = [(Block*20)-20, (Block*20)-1]
 let ind1 = randomIndex(...scope);
 let ind2 = randomIndex(...scope);
 while(ind2 === ind1) {
    ind2 = randomIndex(...scope);
 };
 exp_list[ind1]['stimulus'] = "X"
 exp_list[ind2]['stimulus'] = "X"
 exp_list[ind1]['correct_response'] = null
 exp_list[ind2]['correct_response'] = null

}

const ISIarr = shuffleISI();

export let exp_list: { stimulus: string; correct_response: string | null; ISI: number; Block: number }[] = [];

let block_num = 0;

for (let i = 0; i < 20*19; i++) {
    let ind = randomIndex();
    block_num = (i % 20 == 0) ? Math.floor(i/20): block_num;
    exp_list.push({
        stimulus: letters.target[ind],
        correct_response:' ',
        ISI: (block_num == 0) ? 1000 : ISIarr[block_num - 1],
        Block: block_num,
    })
};

for (let i = 1; i <= 19; i++) {
    asignDistractor(i);
}

/* Example code to show data in a table format */

// export const show_results = (csv_jsPsych: string) => {
//     // csv rows are separated by \r\n
//     const csv = csv_jsPsych.split("\r\n");
//     if (csv.indexOf("") == csv.length - 1) {
//         csv.pop();
//     }
//     let table = document.createElement('table');
//     for (let row of csv) {
//         let tr = table.insertRow();
//         for (let col of row.split(",")) {
//             // Data is embeded in ""
//             col = col.replace(/"/g, '');
//             let td = tr.insertCell();
//             td.innerHTML = col;
//         }
//     }
//     return table;
// };
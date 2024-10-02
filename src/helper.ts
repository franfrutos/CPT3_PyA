// Experimental stimuli
const letters = {
    target: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","Z"],
    distractor: "X",
}

// Useful functions:

const shuffle = (array: string[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 

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


const ISIarr = shuffleISI();
let rand_letters: string[];
console.log(ISIarr);

export let exp_list: { stimulus: string; correct_response: string | null; ISI: number; Block: number }[] = [];


for (let j = 0; j < 19; j ++) {
    rand_letters = shuffle(letters.target).slice(0, 20); // Select 19 random letters
    rand_letters[0] = "X"; rand_letters[1] = "X";  // add two distractors per block
    rand_letters = shuffle(rand_letters); // shuffle the entire array
    console.log(rand_letters);
    for (let i = 0; i < 20; i++) {
        console.log(ISIarr[j-1]);
        exp_list.push({
            stimulus: rand_letters[i],
            correct_response:(rand_letters[i] != "X")?' ':null,
            ISI: (j == 0) ? 1000 : ISIarr[j - 1],
            Block: j,
        })
    };
};



console.log(exp_list);

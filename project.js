const readline = require("readline");
const Chart = require('chart.js'); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function calculateTerm(term, x, y = 0) {
  term = term.replace(/\s/g, '');

  const performOperation = (num1, num2, operator) => {
    switch (operator) {
      case '*':
        return num1 * num2;
      case '/':
        return num1 / num2;
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      default:
        throw new Error('Invalid operator !!');
    }
  };

  const findClosingParenthesis = (expression, startIndex) => {
    let count = 0;
    for (let i = startIndex; i < expression.length; i++) {
      if (expression[i] === '(') {
        count++;
      } else if (expression[i] === ')') {
        count--;
        if (count === 0) {
          return i;
        }
      }
    }
    throw new Error('Wrong parentheses');
  };

  while (term.includes('(')) {
    const openParenIndex = term.lastIndexOf('(');

    const closeParenIndex = findClosingParenthesis(term, openParenIndex);

    const subExpression = term.slice(openParenIndex + 1, closeParenIndex);

    const result = calculateTerm(subExpression, x, y);

    term = term.slice(0, openParenIndex) + result + term.slice(closeParenIndex + 1);
  }

  // Handle 'y=' case
  if (term.includes('y=')) {
    term = term.replace(/y=/g, y.toString());
/*display graph */ 
    plotGraph(term);
  }

  const mulDivRegex = /(\d+\.?\d*)[\/\*](\d+\.?\d*)/;
  while (mulDivRegex.test(term)) {
    term = term.replace(mulDivRegex, (match, num1, num2, offset) => {
      const result = performOperation(
        parseFloat(num1),
        parseFloat(num2),
        term[offset + num1.length]
      );
      return result;
    });
  }

  const addSubRegex = /(\d+\.?\d*)([+-])(\d+\.?\d*)/;
  while (addSubRegex.test(term)) {
    term = term.replace(addSubRegex, (match, num1, operator, num2) => {
      const result = performOperation(
        parseFloat(num1),
        parseFloat(num2),
        operator
      );
      return result;
    });
  }

  return parseFloat(term);
}

function plotGraph(equation) {
  const width = 80;
  const height = 24;
  const xValues = [];
  const yValues = [];
  const maxY = 100; 

  for (let row = 0; row < height; row++) {
    const y = maxY * (1 - row / height);
    yValues.push(y);
  }

  const graph = Array.from({ length: height }, () => Array(width).fill(' '));

  for (let col = 0; col < width; col++) {
    const x = col - width / 2;
    const y = calculateTerm(equation, x, 0); 

    const row = Math.round((1 - y / maxY) * (height - 1));

    graph[row][col] = '*';
  }

  for (let row = 0; row < height; row++) {
    console.log(graph[row].join(''));
  }
}

/* the part 2 */
function findLastCheckedNumber(x) {
  /* converting the input to an array */
  const userInput = Array.from(String(x), Number);
  /*  testing if the current digit is greater than the next digit and return it (from left to right) */
  let i = userInput.length - 2;
  while (i >= 0 && userInput[i] <= userInput[i + 1]) {
    i--;
  }
  /* return the number if there is no index */
  if (i === -1) {
    return x;
  }
  /* creating the last checked number */
  userInput[i] -= 1;
  for (let j = i + 1; j < userInput.length; j++) {
    userInput[j] = 9;
  }
  /* Convert the modified array back to a number */
  return parseInt(userInput.join(""), 10);
}



function handleUserChoice() {
  rl.question(
    "Choose an option:\n1. The Calculator\n2. Find Last Checked Number\n3. Quit\nEnter the number of your choice (1, 2, or 3): ",
    (choice) => {
      if (choice === '1') {
        rl.question('Enter a mathematical term (enter q to quit): ', (term) => {
          if (term.toLowerCase() === 'q') {
            console.log('Quitting the Calculator...');
            handleUserChoice();
          } else {
            const result = calculateTerm(term, 0);
            console.log(`Result: ${result}`);
            
            // Plot graph if the term includes 'y ='
            if (term.toLowerCase().includes('y=')) {
              plotGraph(term.split('y=')[1]);
            }

            handleUserChoice();
          }
        });
      } else if (choice === '2') {
        rl.question(
          'Enter a number between 1 and 10^18 (enter q to quit): ',
          (number) => {
            if (number.toLowerCase() === 'q') {
              console.log('Quitting the Find Last Checked Number...');

              handleUserChoice();
            } else {
              try {
                const lastChecked = findLastCheckedNumber(parseInt(number));

                console.log(`Last Checked Number: ${lastChecked}`);
              } catch (error) {
                console.error(`Error: ${error.message}`);
              } finally {
                handleUserChoice();
              }
            }
          }
        );
      } else if (choice === '3') {
        console.log('Quitting the app.');

        rl.close();
      } else {
        console.log('Invalid choice. Please enter 1, 2, or 3.');
        
        handleUserChoice();
      }
    }
  );
}

handleUserChoice();

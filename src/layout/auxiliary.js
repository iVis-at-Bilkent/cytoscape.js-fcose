/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var auxiliary = {};

auxiliary.multMat = function(array1, array2){
  let result = [];

  for(let i = 0; i < array1.length; i++){
      result[i] = [];
      for(let j = 0; j < array2[0].length; j++){
        result[i][j] = 0;
        for(let k = 0; k < array1[0].length; k++){
          result[i][j] += array1[i][k] * array2[k][j]; 
        }
      }
    } 
  return result;
}; 

auxiliary.multGamma = function(array){
  let result = [];
  let sum = 0;

  for(let i = 0; i < array.length; i++){
    sum += array[i];
  }

  sum *= (-1)/array.length;

  for(let i = 0; i < array.length; i++){
    result[i] = sum + array[i];
  }     
  return result;
};

auxiliary.multL = function(array, C, INV){
  let result = [];
  let temp1 = [];
  let temp2 = [];

  // multiply by C^T
  for(let i = 0; i < C[0].length; i++){
    let sum = 0;
    for(let j = 0; j < C.length; j++){
      sum += -0.5 * C[j][i] * array[j]; 
    }
    temp1[i] = sum;
  }
  // multiply the result by INV
  for(let i = 0; i < INV.length; i++){
    let sum = 0;
    for(let j = 0; j < INV.length; j++){
      sum += INV[i][j] * temp1[j]; 
    }
    temp2[i] = sum;
  }  
  // multiply the result by C
  for(let i = 0; i < C.length; i++){
    let sum = 0;
    for(let j = 0; j < C[0].length; j++){
      sum += C[i][j] * temp2[j]; 
    }
    result[i] = sum;
  } 

  return result;
};

auxiliary.multCons = function(array, constant){
  let result = [];

  for(let i = 0; i < array.length; i++){
    result[i] = array[i] * constant;
  }

  return result;
};

// assumes arrays have same size
auxiliary.minusOp = function(array1, array2){
  let result = [];

  for(let i = 0; i < array1.length; i++){
    result[i] = array1[i] - array2[i];
  }

  return result;
};

// assumes arrays have same size
auxiliary.dotProduct = function(array1, array2){
  let product = 0;

  for(let i = 0; i < array1.length; i++){
    product += array1[i] * array2[i]; 
  }

  return product;
};

auxiliary.mag = function(array){
  return Math.sqrt(this.dotProduct(array, array));
};

auxiliary.normalize = function(array){
  let result = [];
  let magnitude = this.mag(array);

  for(let i = 0; i < array.length; i++){
    result[i] = array[i] / magnitude;
  }

  return result;
};

module.exports = auxiliary;
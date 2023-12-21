
class convertArray {
  constructor(arr){
    this.arr = arr
  }
  errorForm = () => {
    const obj = {};
    this.arr.forEach((element, index) => {
      if (!obj[index]) {
        obj[element.path] = [];
      }
      obj[element.path].push(element.msg);
    });
    return obj
  }
  // errorValid = (array) => {
  //   const obj = {};
  //   array.forEach((element, index) => {
  //     if (!obj[index]) {
  //       obj[element.path] = [];
  //     }
  //     obj[element.path].push(element.msg);
  //   });
  //   return obj
  // }
}

module.exports = convertArray

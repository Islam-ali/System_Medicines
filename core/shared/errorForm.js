
class convertArray {
  constructor(arr){
    this.arr = arr
  }
  errorForm = () => {
    const obj = {};
    console.log(this.arr);
    this.arr.forEach((element, index) => {
      if (!obj[index]) {
        obj[element.path] = [];
      }
      obj[element.path].push(element.msg);
    });
    return obj
  }
}

module.exports = convertArray

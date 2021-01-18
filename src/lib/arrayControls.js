const objIDToString = (id_array) => {
  let new_array = [];
  id_array.forEach((id) => {
    new_array = [...new_array, id.toString()]
  })
  return new_array;
}

const removeSelections = (selections, current_array) => {
  const result = current_array.filter((item) => {
    return !selections.includes(item)
  })
  return result;
}



module.exports = {
  objIDToString: objIDToString,
  removeSelections: removeSelections
}

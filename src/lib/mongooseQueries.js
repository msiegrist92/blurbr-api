const loopFindRefAndAttach = async (base_object, schema_to_search, ref_id_key, attach_key) => {

    for(let doc of base_object){
      await schema_to_search.findById(doc[ref_id_key]).lean().then((res) => {
        doc[attach_key] = res;
      })
    }
}

const loopFindRefLastIndexAndAttach = async (base_object, schema_to_search, ref_id_key, attach_key) => {

    for(let doc of base_object){
      await schema_to_search.findById(doc[ref_id_key][doc[ref_id_key].length - 1]).lean().then((res) => {
        doc[attach_key] = res;
      })
    }
}

const populateByRefId = async (ref_ids, schema_to_search) => {
  let array = [];
  for (let id of ref_ids){
    await schema_to_search.findById(id).lean().then((res) => {
      array.push(res);
    })
  }
  return array;
}

const populateByRefIdWithVirtual = async (ref_ids, schema_to_search, virtual_name) => {
  let array = [];
  for(let id of ref_ids){
    console.log(id)
    await schema_to_search.findById(id).populate(virtual_name).lean().then((res) => {
      array.push(res)
    })
  }
  return array;
}


module.exports = {
  loopFindRefAndAttach: loopFindRefAndAttach,
  loopFindRefLastIndexAndAttach: loopFindRefLastIndexAndAttach,
  populateByRefId: populateByRefId,
  populateByRefIdWithVirtual: populateByRefIdWithVirtual
}

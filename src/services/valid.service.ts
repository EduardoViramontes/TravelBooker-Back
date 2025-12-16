import moment from "moment";
import db from "../db";

export class Valid {
  fields: any;
  data: any;
  registro: any;
  typesParametros: Record<string, Function>;

  constructor(fields:any, data: any) {
    this.fields = fields;
    this.data = data;
    this.registro = {}
    this.typesParametros = {
      string: this.validString.bind(this),
      email: this.validEmail.bind(this),
      boolean: this.validBoolean.bind(this),
      date: this.validDate.bind(this),
      dateonly: this.validDate.bind(this),
      model: this.validModel.bind(this),
      integer: this.validInt.bind(this),
    };
  }

  async toValid(){
    for(const field of this.fields){
      const fn = this.typesParametros[field.value.toLowerCase()]
      const resp = await fn(field)
      if(resp.status === false){
        return resp
      }
    }
    return this.registro
  }

  async validString(field: any){
    const value = this.data[field.key]
    if((value === "" || value === undefined || value === null) ){
      if(field.required) return { status:false , msg: 'Falta campo requerido.', field: field.key}
      return { status:true }
    } else if(typeof value != field.value.toLowerCase()){
      if(field.required) return { status:false , msg: `El parametro ${field.key} debe ser ${field.value.toLowerCase()} pero se recibio ${typeof value}.`}
      return { status:true }
    } else if(value.length > field.length){
      if(field.required) return { status:false , msg: `El parámetro ${field.key} tiene una longitud de ${value.length} caracteres, lo cual supera la longitud permitida de ${field.length} caracteres.`}
      return { status:true }
    }
    this.registro[field.key] = field.key == "password" ? value :value.toUpperCase()
    return { status:true }
  }

  async validEmail(field: any){
    const value = this.data[field.key]
    if((value === "" || value === undefined || value === null) ){
      if(field.required)return { status:false , msg: 'Falta campo requerido.', field: field.key}
      return { status:true }
    } else if(typeof value != "string"){
      if(field.required)return { status:false , msg: `El parametro ${field.key} debe ser string pero se recibio ${typeof value}.`}
      return { status:true }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailIsValid = emailRegex.test(value)
    if(!emailIsValid){
      if(field.required)return { status:false , msg: `Formato no váido. El parametro ${field.key} debe ser un email válido.`, field: field.key }
      return { status:true }
    } 
    this.registro[field.key] = value
    return { status:true }
  }


  async validBoolean(field: any){
    const value = this.data[field.key]
    if(value !== true && value !== false ){
      if(field.required)return { status:false , msg: 'Falta campo requerido.', field: field.key}
      return { status:true }
    } else if( typeof value != field.value.toLowerCase()){
      if(field.required)return { status:false , msg: `El parametro ${field.key} debe ser ${field.value.toLowerCase()} pero se recibio ${typeof value}.`}
      return { status:true }
    }
    this.registro[field.key] = value
    return { status:true }
  }

  async validDate(field: any){
    const value = this.data[field.key]

    if((!moment(value, field.format, true).isValid()) ){
      if(field.required)return { status:false , msg: `Formato no váido. El parametro ${field.key} debe contener el formato ${field.format}.`, field: field.key}
      return { status:true }
    }
    this.registro[field.key] = moment(value)
    return { status:true }
  }

  async validModel(field: any){
    const value = this.data[field.key]
    if(typeof value != "number"){
      if(field.required)return { status:false , msg: `El parametro ${field.key} debe ser number pero se recibio ${typeof value}.`}
      return { status:true }
    }
    const model = db.models[field.modelReference.model]
    const registrosEncontrado = await model.findByPk(value);

    if(registrosEncontrado == undefined){
      if(field.required)return { status:false , msg: `Registro con ID ${value} no encontrado.`}
      return { status:true }
    }
    if(registrosEncontrado.deletedAt != null){
      if(field.required)return { status:false , msg: `Registro con ID ${value} eliminado.`}
      return { status:true }
    }

    this.registro[field.key] = value
    return { status:true }
  }
  
  async validInt(field: any){
    const value = this.data[field.key]
    if(!Number.isInteger(value) || typeof value !== 'number'){
      if(field.required) return { status:false , msg: 'Falta campo requerido.', field: field.key}
      return { status:true }
    } else if(typeof value != 'number'){
      if(field.required) return { status:false , msg: `El parametro ${field.key} debe ser number pero se recibio ${typeof value}.`}
      return { status:true }
    } else if(value == 0){
      if(field.required) return { status:false , msg: `El parámetro ${field.key} debe ser mayor a 0.`}
      return { status:true }
    }
    this.registro[field.key] = value 
    return { status:true }
  }

}

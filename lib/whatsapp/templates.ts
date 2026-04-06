export function mensajeBienvenida(params: {
  nombre: string;
  unidad: string;
  propiedad: string;
  monto: string;
  moneda: string;
  diaVencimiento: number;
  linkPago: string;
}) {
  return `¡Hola ${params.nombre}! 👋

Te damos la bienvenida a *${params.propiedad} - ${params.unidad}*.

Tu arriendo mensual es de *${params.moneda} ${params.monto}* y vence cada día *${params.diaVencimiento}* del mes.

Cuando realices tu pago, podés subir el comprobante desde este link:
🔗 ${params.linkPago}

Cualquier consulta estamos a tu disposición. ¡Bienvenido/a! 🏠`;
}

export function mensajeAviso5Dias(params: {
  nombre: string;
  monto: string;
  moneda: string;
  fechaVencimiento: string;
  linkPago: string;
}) {
  return `Hola ${params.nombre} 👋

Te recordamos que tu arriendo de *${params.moneda} ${params.monto}* vence el *${params.fechaVencimiento}*.

Podés realizar tu pago con anticipación y subir el comprobante aquí:
🔗 ${params.linkPago}

¡Gracias por tu puntualidad! 🙌`;
}

export function mensajeRecordatorio(params: {
  nombre: string;
  monto: string;
  moneda: string;
  fechaVencimiento: string;
  linkPago: string;
}) {
  return `Hola ${params.nombre} ⚠️

Notamos que tu arriendo de *${params.moneda} ${params.monto}* venció el *${params.fechaVencimiento}* y aún no registramos tu pago.

Si ya pagaste, subí tu comprobante aquí para que lo procesemos:
🔗 ${params.linkPago}

Si tenés algún inconveniente, comunicate con nosotros. 🙏`;
}

// Mantenemos el viejo por compatibilidad
export function paymentReminderTemplate(params: {
  nombre: string;
  monto: string;
  fecha: string;
  link: string;
}) {
  return mensajeAviso5Dias({
    nombre: params.nombre,
    monto: params.monto,
    moneda: "",
    fechaVencimiento: params.fecha,
    linkPago: params.link,
  });
}

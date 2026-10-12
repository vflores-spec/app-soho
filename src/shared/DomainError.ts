// Un error propio del negocio. "extends Error" significa que es un tipo de error de JavaScript,
// pero con nombre propio, para distinguirlo de los errores inesperados (bugs).
// "export" lo hace visible para que otros archivos puedan importarlo.
export class DomainError extends Error {}
import { PutUserDto } from "./put.user.dto";

// No patch, atualizaremos informações **específicas** e não mais todo o objeto, como no put.
// Por isso, utilizamos a ferramenta Partial, to próprio Typescript.
export interface PatchUserDto extends Partial<PutUserDto> {}

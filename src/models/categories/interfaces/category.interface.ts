export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parent?: ICategory; // Opcional para categorías raíz
  children?: ICategory[]; // Lista de categorías hijas
}

export interface ICategoryCreate {
  name: string;
  slug: string;
  parentId?: string; // Para asignar una categoría padre al crear
}

export interface ICategoryUpdate {
  name?: string;
  slug?: string;
  parentId?: string | null; // Para cambiar la categoría padre o eliminarla
}

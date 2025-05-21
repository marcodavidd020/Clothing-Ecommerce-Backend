export interface ICategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  children?: ICategory[];
  hasChildren?: boolean;
}

export interface ICategoryCreate {
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string;
}

export interface ICategoryUpdate {
  name?: string;
  slug?: string;
  image?: string | null;
  parentId?: string | null;
}

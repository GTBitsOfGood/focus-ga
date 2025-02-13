export type ExtendId<T> = T & { _id: string };
export type Filter<T> = {
    label: string;
    data: T[];
    selected: T[];
    setSelected: (selected: T) => void;
    searchable?: boolean;
}

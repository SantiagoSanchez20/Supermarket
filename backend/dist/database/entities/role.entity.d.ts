export declare enum RoleType {
    ADMIN = "ADMIN",
    CAJERO = "CAJERO",
    ABASTECIMIENTO = "ABASTECIMIENTO"
}
export declare class Role {
    id: string;
    name: RoleType;
    description: string;
}

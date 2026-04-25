export interface Role { id: number; nom: string; }
export interface Utilisateur { id?: number; login: string; password?: string; role: Role; }
export interface Domaine { id?: number; libelle: string; }
export interface Profil { id?: number; libelle: string; }
export interface Structure { id?: number; libelle: string; }
export interface Employeur { id?: number; nomEmployeur: string; }
export interface Formateur { id?: number; nom: string; prenom: string; email?: string; tel?: string; type: string; employeur?: Employeur; }
export interface Participant { id?: number; nom: string; prenom: string; email?: string; tel?: string; structure: Structure; profil: Profil; }
export interface Formation {
  id?: number; titre: string; annee: number; duree: number;
  budget?: number; lieu?: string; dateFormation?: string;
  domaine: Domaine; formateur?: Formateur; participants?: Participant[];
  createdById?: number; createdByLogin?: string;
}
export interface LoginRequest { login: string; password: string; }
export interface LoginResponse { token: string; role: string; login: string; id: number; }

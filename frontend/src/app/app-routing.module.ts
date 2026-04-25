import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DomainesComponent } from './features/domaines/domaines.component';
import { ProfilsComponent } from './features/profils/profils.component';
import { StructuresComponent } from './features/structures/structures.component';
import { EmployeursComponent } from './features/employeurs/employeurs.component';
import { FormateursComponent } from './features/formateurs/formateurs.component';
import { ParticipantsComponent } from './features/participants/participants.component';
import { FormationsComponent } from './features/formations/formations.component';
import { UtilisateursComponent } from './features/utilisateurs/utilisateurs.component';
import { AccessDeniedComponent } from './features/access-denied/access-denied.component';

const routes: Routes = [
  { path: '',              component: LandingComponent,     pathMatch: 'full' },
  { path: 'login',         component: LoginComponent },
  { path: 'register',      component: RegisterComponent },
  { path: 'verify-email',  component: VerifyEmailComponent },
  { path: 'access-denied', component: AccessDeniedComponent, canActivate: [AuthGuard] },

  {
    path: 'app',
    canActivate: [AuthGuard],
    children: [
      // RESPONSABLE + ADMIN : dashboard
      { path: 'dashboard', component: DashboardComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','RESPONSABLE'] } },

      // TOUS : formations
      { path: 'formations', component: FormationsComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','RESPONSABLE','UTILISATEUR'] } },

      // ADMIN + RESPONSABLE + UTILISATEUR
      { path: 'participants', component: ParticipantsComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','UTILISATEUR','RESPONSABLE'] } },
      { path: 'formateurs', component: FormateursComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','UTILISATEUR','RESPONSABLE'] } },

      // ADMIN + RESPONSABLE + UTILISATEUR (lecture pour RESPONSABLE et UTILISATEUR)
      { path: 'domaines', component: DomainesComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','RESPONSABLE','UTILISATEUR'] } },

      // ADMIN (CRUD) + UTILISATEUR (consultation uniquement — géré dans le composant)
      { path: 'profils',    component: ProfilsComponent,    canActivate: [RoleGuard],
        data: { roles: ['ADMIN','UTILISATEUR'] } },
      { path: 'structures', component: StructuresComponent, canActivate: [RoleGuard],
        data: { roles: ['ADMIN','UTILISATEUR'] } },

      // ADMIN seulement
      { path: 'employeurs',   component: EmployeursComponent,   canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
      { path: 'utilisateurs', component: UtilisateursComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },

      { path: '', redirectTo: 'formations', pathMatch: 'full' }
    ]
  },

  // Compat redirects
  { path: 'dashboard',    redirectTo: 'app/dashboard',    pathMatch: 'full' },
  { path: 'formations',   redirectTo: 'app/formations',   pathMatch: 'full' },
  { path: 'participants', redirectTo: 'app/participants',  pathMatch: 'full' },
  { path: 'formateurs',   redirectTo: 'app/formateurs',   pathMatch: 'full' },
  { path: '**',           redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

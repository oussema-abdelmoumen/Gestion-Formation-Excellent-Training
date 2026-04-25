import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AppComponent } from './app.component';
import { NavbarComponent } from './features/navbar/navbar.component';
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

@NgModule({
  declarations: [
    AppComponent, NavbarComponent, LandingComponent,
    LoginComponent, RegisterComponent, VerifyEmailComponent,
    DashboardComponent, DomainesComponent, ProfilsComponent,
    StructuresComponent, EmployeursComponent, FormateursComponent,
    ParticipantsComponent, FormationsComponent, UtilisateursComponent,
    AccessDeniedComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,
    HttpClientModule, AppRoutingModule, NgChartsModule,
    MatToolbarModule, MatCardModule, MatInputModule, MatButtonModule,
    MatTableModule, MatSelectModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule, MatChipsModule, MatDividerModule, MatBadgeModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}

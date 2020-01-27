import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RealtimeComponent } from "./realtime/realtime.component";
import { VersionComponent } from "./version/version.component";
const routes: Routes = [
  { path: "", redirectTo: "realtime", pathMatch: "full" },
  { path: "realtime", component: RealtimeComponent },
  { path: "version", component: VersionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

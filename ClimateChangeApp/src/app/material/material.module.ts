import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material'
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import {MatTableModule} from '@angular/material/table';

const Materials = [
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatToolbarModule,
  MatDialogModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatIconModule,
  MatButtonModule,
  LayoutModule,
  MatTableModule,
]

@NgModule({
  declarations: [],
  imports: [Materials],
  exports: [Materials]
})
export class MaterialModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { SliderComponent } from './slider/slider.component';



@NgModule({
   imports: [
    CommonModule,
    HomeRoutingModule
  ],
  declarations: [SliderComponent]
})
export class HomeModule { }

import { Component, ElementRef, HostListener, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ss-resizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="resizer" 
      [class.horizontal]="direction === 'horizontal'" 
      [class.vertical]="direction === 'vertical'"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)">
      <div class="handle"></div>
    </div>
  `,
  styles: [`
    .resizer {
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--wire);
      transition: background 0.2s, box-shadow 0.2s;
      z-index: 10;
      user-select: none;
      
      &.horizontal {
        width: 4px;
        cursor: col-resize;
        height: 100%;
        &:hover, &.dragging {
          background: var(--v);
          box-shadow: 0 0 10px var(--v);
          width: 6px;
        }
      }

      &.vertical {
        height: 4px;
        cursor: row-resize;
        width: 100%;
        &:hover, &.dragging {
          background: var(--v);
          box-shadow: 0 0 10px var(--v);
          height: 6px;
        }
      }

      .handle {
        width: 1px;
        height: 12px;
        background: rgba(255,255,255,0.2);
        &.vertical { width: 12px; height: 1px; }
      }
    }
  `]
})
export class ResizerComponent {
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
  @Output() resize = new EventEmitter<number>();

  private isDragging = false;

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.emitResize(this.direction === 'horizontal' ? event.clientX : event.clientY);
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDragging = false;
    document.body.classList.remove('resizing');
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const touch = event.touches[0];
    this.emitResize(this.direction === 'horizontal' ? touch.clientX : touch.clientY);
  }

  @HostListener('window:touchend')
  onTouchEnd() {
    this.onMouseUp();
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.startDragging();
  }

  onTouchStart(event: TouchEvent) {
    this.startDragging();
  }

  private startDragging() {
    this.isDragging = true;
    document.body.classList.add('resizing');
  }

  private emitResize(pos: number) {
    this.resize.emit(pos);
  }
}

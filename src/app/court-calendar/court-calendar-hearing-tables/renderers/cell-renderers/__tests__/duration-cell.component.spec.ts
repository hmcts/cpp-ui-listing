import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DurationCellComponent } from '../duration-cell.component';

describe('DurationCellComponent', () => {
  let component: DurationCellComponent;
  let fixture: ComponentFixture<DurationCellComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DurationCellComponent);
    component = fixture.componentInstance;

    component.duration = 90;
    component.dayOfHearing = 1;
    component.totalDays = 1;
    component.displayMultiHearingDay = true;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.displayMultiHearingDay).toBe(true);
    });

    it('should have OnPush change detection strategy', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    it('should have proper data-test-id', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('[data-test-id="duartion"]'));
      expect(container).toBeTruthy();
      expect(container.nativeElement.classList.contains('offences')).toBe(true);
    });

    it('should display formatted duration', () => {
      component.duration = 90;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 hour 30 minutes');
    });

    it('should apply timeDuration pipe to duration', () => {
      component.duration = 120;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('2 hours');
    });
  });

  describe('Multi-day Tag Logic', () => {
    describe('when totalDays > 1', () => {
      beforeEach(() => {
        component.totalDays = 3;
      });

      it('should show pdk-tag when totalDays > 1', () => {
        fixture.detectChanges();

        const tag = fixture.debugElement.query(By.css('pdk-tag'));
        expect(tag).toBeTruthy();
      });

      it('should have correct tag properties', () => {
        fixture.detectChanges();

        const tag = fixture.debugElement.query(By.css('pdk-tag'));
        expect(tag.nativeElement.hasAttribute('condensed')).toBe(true);
        expect(tag.nativeElement.getAttribute('pdk-margin-top')).toBe('2');
        expect(tag.componentInstance.color).toBe('turquoise');
      });

      describe('when displayMultiHearingDay is true', () => {
        beforeEach(() => {
          component.displayMultiHearingDay = true;
          component.dayOfHearing = 2;
          component.totalDays = 3;
        });

        it('should show day X of Y format', () => {
          fixture.detectChanges();

          const daySpan = fixture.debugElement.query(By.css('pdk-tag span'));
          expect(daySpan).toBeTruthy();
          expect(daySpan.nativeElement.textContent.trim()).toBe('Day 2 of 3');
        });

        it('should hide multi-day text', () => {
          fixture.detectChanges();

          const spans = fixture.debugElement.queryAll(By.css('pdk-tag span'));
          const multiDaySpanText = spans.find(
            (span) => span.nativeElement.textContent.trim() === 'Multi-day'
          );
          expect(multiDaySpanText).toBeFalsy();
        });

        it('should handle different day numbers', () => {
          component.dayOfHearing = 1;
          component.totalDays = 5;
          fixture.detectChanges();

          const daySpan = fixture.debugElement.query(By.css('pdk-tag span'));
          expect(daySpan.nativeElement.textContent.trim()).toBe('Day 1 of 5');
        });
      });

      describe('when displayMultiHearingDay is false', () => {
        beforeEach(() => {
          component.displayMultiHearingDay = false;
          component.dayOfHearing = 2;
          component.totalDays = 3;
        });

        it('should show "Multi-day" text', () => {
          fixture.detectChanges();

          const spans = fixture.debugElement.queryAll(By.css('pdk-tag span'));
          const multiDaySpan = spans.find(
            (span) => span.nativeElement.textContent.trim() === 'Multi-day'
          );
          expect(multiDaySpan).toBeTruthy();
        });

        it('should hide day X of Y format', () => {
          fixture.detectChanges();

          const spans = fixture.debugElement.queryAll(By.css('pdk-tag span'));
          const daySpan = spans.find((span) => span.nativeElement.textContent.includes('Day'));
          expect(daySpan).toBeFalsy();
        });
      });
    });

    describe('when totalDays <= 1', () => {
      it('should not show pdk-tag when totalDays = 1', () => {
        component.totalDays = 1;
        fixture.detectChanges();

        const tag = fixture.debugElement.query(By.css('pdk-tag'));
        expect(tag).toBeNull();
      });

      it('should not show pdk-tag when totalDays = 0', () => {
        component.totalDays = 0;
        fixture.detectChanges();

        const tag = fixture.debugElement.query(By.css('pdk-tag'));
        expect(tag).toBeNull();
      });

      it('should not show pdk-tag when totalDays is undefined', () => {
        component.totalDays = undefined as any;
        fixture.detectChanges();

        const tag = fixture.debugElement.query(By.css('pdk-tag'));
        expect(tag).toBeNull();
      });
    });
  });

  describe('Duration Formatting', () => {
    it('should handle zero duration', () => {
      component.duration = 0;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle single minute', () => {
      component.duration = 1;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 minute');
    });

    it('should handle multiple minutes only', () => {
      component.duration = 45;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('45 minutes');
    });

    it('should handle exact single hour', () => {
      component.duration = 60;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 hour');
    });

    it('should handle multiple exact hours', () => {
      component.duration = 180;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('3 hours');
    });

    it('should handle hours and minutes', () => {
      component.duration = 135;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('2 hours 15 minutes');
    });

    it('should handle single day', () => {
      component.duration = 360;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 day');
    });

    it('should handle multiple days', () => {
      component.duration = 720;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('2 days');
    });

    it('should handle days, hours, and minutes', () => {
      component.duration = 495;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 day 2 hours 15 minutes');
    });

    it('should handle days and minutes only', () => {
      component.duration = 375;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('1 day  15 minutes');
    });

    it('should handle null duration', () => {
      component.duration = null as any;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle undefined duration', () => {
      component.duration = undefined as any;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative duration', () => {
      component.duration = -30;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('-1 day -1 hour -30 minute');
    });

    it('should handle negative totalDays', () => {
      component.totalDays = -1;
      fixture.detectChanges();

      const tag = fixture.debugElement.query(By.css('pdk-tag'));
      expect(tag).toBeNull();
    });

    it('should handle negative dayOfHearing', () => {
      component.totalDays = 3;
      component.dayOfHearing = -1;
      component.displayMultiHearingDay = true;
      fixture.detectChanges();

      const daySpan = fixture.debugElement.query(By.css('pdk-tag span'));
      expect(daySpan.nativeElement.textContent.trim()).toBe('Day -1 of 3');
    });

    it('should handle zero dayOfHearing', () => {
      component.totalDays = 3;
      component.dayOfHearing = 0;
      component.displayMultiHearingDay = true;
      fixture.detectChanges();

      const daySpan = fixture.debugElement.query(By.css('pdk-tag span'));
      expect(daySpan.nativeElement.textContent.trim()).toBe('Day 0 of 3');
    });

    it('should handle dayOfHearing greater than totalDays', () => {
      component.totalDays = 3;
      component.dayOfHearing = 5;
      component.displayMultiHearingDay = true;
      fixture.detectChanges();

      const daySpan = fixture.debugElement.query(By.css('pdk-tag span'));
      expect(daySpan.nativeElement.textContent.trim()).toBe('Day 5 of 3');
    });
  });

  describe('Component Integration', () => {
    it('should work correctly with minimal inputs', () => {
      component.duration = 30;
      component.totalDays = 1;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      const tag = fixture.debugElement.query(By.css('pdk-tag'));

      expect(durationDiv.nativeElement.textContent.trim()).toBe('30 minutes');
      expect(tag).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should provide meaningful text content', () => {
      component.duration = 45;
      component.totalDays = 1;
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('[data-test-id="duartion"]'));
      const textContent = container.nativeElement.textContent.trim();

      expect(textContent).toBe('45 minutes');
    });
  });

  describe('Performance', () => {
    it('should handle large duration values', () => {
      component.duration = 999999;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent).toContain('days');
    });

    it('should handle rapid property changes', () => {
      const values = [30, 60, 90, 120, 150];

      values.forEach((duration) => {
        component.duration = duration;
        fixture.detectChanges();

        const durationDiv = fixture.debugElement.query(By.css('div > div'));
        expect(durationDiv.nativeElement.textContent.trim()).toBeTruthy();
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical single-day hearing', () => {
      component.duration = 120;
      component.totalDays = 1;
      component.dayOfHearing = 1;
      component.displayMultiHearingDay = true;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      const tag = fixture.debugElement.query(By.css('pdk-tag'));

      expect(durationDiv.nativeElement.textContent.trim()).toBe('2 hours');
      expect(tag).toBeNull();
    });

    it('should handle typical multi-day hearing with day display', () => {
      component.duration = 480;
      component.totalDays = 5;
      component.dayOfHearing = 3;
      component.displayMultiHearingDay = true;
      fixture.detectChanges();

      const tag = fixture.debugElement.query(By.css('pdk-tag'));

      expect(tag).toBeTruthy();
    });

    it('should handle short hearing duration', () => {
      component.duration = 15;
      component.totalDays = 1;
      fixture.detectChanges();

      const durationDiv = fixture.debugElement.query(By.css('div > div'));
      expect(durationDiv.nativeElement.textContent.trim()).toBe('15 minutes');
    });
  });
});

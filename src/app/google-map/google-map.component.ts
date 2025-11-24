// google-map.component.ts
import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private map: google.maps.Map | undefined;
  private marker: google.maps.Marker | undefined;
  private resizeObserver: ResizeObserver | undefined;
  
  isLoading = true;
  hasError = false;
  
  // Bakery location coordinates (example coordinates for Paris, France)
  private readonly bakeryLocation = {
    lat: 48.8566,
    lng: 2.3522
  };

  ngOnInit() {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit() {
    // Initialize resize observer for responsive behavior
    this.initializeResizeObserver();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.map) {
      setTimeout(() => {
        google.maps.event.trigger(this.map!, 'resize');
        this.map!.setCenter(this.bakeryLocation);
      }, 300);
    }
  }

  private initializeResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          setTimeout(() => {
            google.maps.event.trigger(this.map!, 'resize');
          }, 100);
        }
      });
      
      if (this.mapContainer?.nativeElement) {
        this.resizeObserver.observe(this.mapContainer.nativeElement);
      }
    }
  }

  private loadGoogleMapsScript() {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    script.onerror = () => {
      this.isLoading = false;
      this.hasError = true;
      console.error('Failed to load Google Maps script');
    };
    
    document.head.appendChild(script);
  }

  initializeMap() {
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container not found');
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    try {
      this.isLoading = true;
      this.hasError = false;

      const mapOptions: google.maps.MapOptions = {
        center: this.bakeryLocation,
        zoom: 15,
        styles: this.getMapStyles(),
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative'
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      // Add custom marker
      this.marker = new google.maps.Marker({
        position: this.bakeryLocation,
        map: this.map,
        title: 'Artisan Bakery',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#D97706" stroke="white" stroke-width="3"/>
              <path d="M15 15L25 25M25 15L15 25" stroke="white" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        },
        animation: google.maps.Animation.DROP
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2 max-w-xs">
            <h3 class="font-semibold text-stone-800">Artisan Bakery</h3>
            <p class="text-sm text-stone-600 mt-1">123 Bakery Street</p>
            <p class="text-sm text-stone-600">Fresh bread daily</p>
            <div class="mt-2">
              <button onclick="window.open('https://maps.google.com?q=48.8566,2.3522', '_blank')" 
                      class="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                Get Directions →
              </button>
            </div>
          </div>
        `
      });

      this.marker.addListener('click', () => {
        infoWindow.open(this.map!, this.marker!);
      });

      this.isLoading = false;

    } catch (error) {
      console.error('Error initializing map:', error);
      this.isLoading = false;
      this.hasError = true;
    }
  }

  private getMapStyles(): google.maps.MapTypeStyle[] {
    return [
      {
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }]
      },
      {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#f5f5f5" }]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#eeeeee" }]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#e5e5e5" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#dadada" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#c9c9c9" }]
      }
    ];
  }
}
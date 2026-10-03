// One sound preference and one foreground source. Microphones have separate controls.
export class GalleryAudioState {
 enabled=false;
 source=null;
 suspended=false;
 setEnabled(value){this.enabled=!!value;}
 claim(source){this.source=source;}
 release(source){if(this.source===source)this.source=null;}
 allows(source){return this.enabled&&!this.suspended&&this.source===source;}
}

export interface IElementsReturn {
  remove: ()=>void;
  class: string;
  ui: string[];
}

interface IUi {
  [key: string]: HTMLElement | null;
}

interface IVideoPlayerElementsCreate {
  [key: string]: IElementsReturn;
}

interface IVideoPlayerUI {
  unMount: () => void;
  controls: (container: HTMLDivElement | null) => IElementsReturn;
  createUI: () => IVideoPlayerElementsCreate;
}

interface IFactoryEvent {
  [key: string]: (event: MouseEvent, el: HTMLElement) => void;
}

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    //pictureInPictureEnabled: boolean;
  }

  interface HTMLDivElement {
    mozRequestFullScreen(): Promise<void>;
    webkitRequestFullscreen(): Promise<void>;
    mozRequestFullScreen(): Promise<void>;
    msRequestFullscreen(): Promise<void>;
  }
}

export enum UiClasses {
  play = 'videoPlay',
  stop = 'videoStop',
  pause = 'videoPause',
  start = 'videoStart',
  fullscreen = 'videoFullscreen',
  fullscreenCancel = 'videoFullscreenCancel',
  buffer = 'playerBufferedAmount',
  progress = 'playerProgressAmount',
  track = 'playerTrack',
  volume = 'videoVolume',
  rangeVolume = 'videoVolumeRange',
  labelValue = 'player-volume-label',
  volumeProgressContainer = 'playerVolumeContainer',
  videoPlayerControls = 'videoPlayerControls',
  videoContainerOverlay = 'overlayVideoContainer',
  videoOverlayBtn = 'overlayVideoBtn',
  trackTime = 'palyertrackTime',
  trackTimeFull = 'palyertrackTimeFull',
  subtitleBtn = 'playerSubtitleBtn',
  subtitleItem = 'playerSubtitleItem',
  subtitleList = 'palyersubtitleList',
  video = 'playerVideo',
  doubleTap = 'doubleTap',
  doubleTapLeft = 'doubleTapLeft',
  doubleTapRight= 'doubleTapRight',
  playToTime = "playToTimeBtn",
  playToTimeContainer= 'playToTimeContainer',
  qualityBtn = 'playerQualityBtn',
  qualityItem = 'playerQualityItem',
  qualityList = 'playerQualityList',
}

enum FadeTime {
  fullscreen = 30,
  controls = 25,
  volume = 20,
  subtitle = 60,
}

interface IFade {
  el: HTMLElement;
  display?: string;
  time?: number;
  callback?: () => void;
}

interface IVolumeClasses {
  btn: string;
  volume: string;
  range: string;
}
export interface IVideoPlayerUIParam {
  volumeValue: number;
  icons: string;
  subtitles?: NodeListOf<HTMLTrackElement> | null;
  subtitlesInit?: boolean | undefined;
  timeTrackOffset?: number | undefined;
  timeStore: number;
}

interface IBrowser{
  browser: string; 
  class: string;
}

enum Browser {
  moz = 'Mozilla Firefox',
  opera = 'Opera',
  ie = 'Microsoft Internet Explorer',
  edge = 'Microsoft Edge',
  google = 'Google Chrome or Chromium',
  safari = 'Apple Safari',
  unknown = 'unknown',
}
enum PlayerKey{
  storeInfo = "player-info",
  dataset = "name",
  storeInfoPrev = "player-info-prev",
}
interface IPlayerStoreTime{
  name: string;
  time: number;
}
export interface IVideoPlayer {
  videoContainer: string;
  iconsFolder: string;
  subtitle?: boolean;
  volumeValue?: number;
  timeTrackOffset?: number;
  videoPlayerUI?: (videoContainer: HTMLDivElement | null, param: IVideoPlayerUIParam)=> IVideoPlayerUI;
  storeTimeOffset?: number;
}

export enum IVideoPlayerDefaultConst {
  volume = 100,
  timeTrackOffset = 3,

}

export class VideoPlayerUI implements IVideoPlayerUI {

  protected container: HTMLDivElement | null;
  protected volumeValue: number;
  protected subtitlesList: NodeListOf<HTMLTrackElement> | null;
  protected icons: string;
  protected subtitlesInit?: boolean | undefined;
  protected timeTrackOffset?: number | undefined;
  private storeTime: number;
  private utils: IVideoUtils;
  private unMountList: {[key: string]: ()=> void} = {};

  constructor(videoContainer: HTMLDivElement | null, param: IVideoPlayerUIParam) {
    this.container = videoContainer;
    this.volumeValue = param.volumeValue;
    this.icons = param.icons;
    this.subtitlesList = param.subtitles || null;
    this.controls = this.controls.bind(this);
    this.volume = this.volume.bind(this);
    this.overlayPlay = this.overlayPlay.bind(this);
    this.subtitles = this.subtitles.bind(this);
    //this.videoQuality = this.videoQuality.bind(this);
    this.subtitlesInit = param.subtitlesInit;
    this.timeTrackOffset = param.timeTrackOffset;
    this.storeTime = param.timeStore;
    this.utils = new VideoUtils();
  }

  unMount = (): void => {
    for (var key in this.unMountList) {
      this.unMountList[key]();
    }
  };

  protected subtitles({
    btn,
    cItem,
    listTrack,
    track,
  }: {
    btn: string;
    cItem: string;
    listTrack: string;
    track: NodeListOf<HTMLTrackElement> | null;
  }) {
    const trackList = () => {
      let items = '';

      if (track) {
        track.forEach((item) => {
          items += `
            <div class="${cItem} subtitle-item" data-lang="${item.lang}">
              ${item.label}
            </div>
          `;
        });

        items += `
          <div class="${cItem} subtitle-item active" data-lang="off">
            Выкл.
          </div>`;
      }

      return items;
    };

    return this.subtitlesInit
      ? `
    <div class="player-btn-pp player-subtitle-container">
      <div class="subtitle-list ${listTrack}" style="display: none">
        ${trackList()}
      </div>
      <button class="${btn} btn-cc controls-btn">CC</button>
    </div>
    `
      : '';
  }

  // protected videoQuality({
  //   btn,
  //   cItem,
  //   listTrack,
  //   track,
  // }: {
  //   btn: string;
  //   cItem: string;
  //   listTrack: string;
  //   track: NodeListOf<HTMLTrackElement> | null;
  // }) {
  //   const trackList = () => {
  //     let items = '';

  //     if (track) {
  //       track.forEach((item) => {
  //         items += `
  //           <div class="${cItem} subtitle-item" data-lang="${item.lang}">
  //             ${item.label}
  //           </div>
  //         `;
  //       });

  //       items += `
  //         <div class="${cItem} subtitle-item active" data-lang="off">
  //           Выкл.
  //         </div>`;
  //     }

  //     return items;
  //   };

  //   return this.subtitlesInit
  //     ? `
  //   <div class="player-btn-pp player-subtitle-container">
  //     <div class="subtitle-list ${listTrack}" style="display: none">
  //       ${trackList()}
  //     </div>
  //     <button class="${btn} btn-cc controls-btn">CC</button>
  //   </div>
  //   `
  //     : '';
  // }

  protected volume({ btn, volume, range }: IVolumeClasses) {
    return `
      <div class="player-btn-pp player-volume-container">

        <div class="player-volume-range-wrap ${range}" style="display: none;">
          <input type="range" class="input-player-range ${volume}" value="${this.volumeValue}" name="volume" min="0" max="100">
          <div class="player-volume-label">
            ${this.volumeValue}%
          </div>
        </div>
       
        <button class="${btn} controls-btn">
           <img src="${this.icons}/volume.svg" alt="volume"> 
        </button>
      </div>
    `;
  }

  protected fullscreen = (on: string, off: string) => {
    return `
        <div class="player-btn-pp">
            <button class="${on} controls-btn">
              <img src="${this.icons}/fullscreen.svg" alt="fullscreen on">
            </button>
            <button class="${off} controls-btn" style="display: none;">
              <img src="${this.icons}/fullscreen-off.svg" alt="fullscreen off">
            </button>
          </div>
    `;
  };

  protected play(play: string, pause: string) {
    return `
      <div class="player-btn-pp">
        <button class="${play} controls-btn">
          <img src="${this.icons}/play.svg" alt="play">
        </button>
        <button class="${pause} controls-btn" style="display: none;">
          <img src="${this.icons}/pause.svg" alt="pause">
        </button>
      </div>
    `;
  }

  protected track(container: string, progress: string, buffer: string, time: string, timeFull: string) {
    return `
        <div class="player-track-container">
          <div class="player-track-time">
            <span class="${time}">00.00</span>
            <span class="player-track-time_sp">/</span>
            <span class="${timeFull}">00.00</span>
          </div>
          <div class="player-track ${container}" >
          </div>
          <div class="player-buffered">
            <span class="player-buffered-amount ${buffer}"></span>
          </div>
          <div class="player-progress">
            <span class="player-progress-amount ${progress}"></span>
          </div>
        </div>
      `;
  }

  protected doubleTap(): IElementsReturn{
    const uiClasses = {
      doubleTapLeft: UiClasses.doubleTapLeft,
      doubleTapRight: UiClasses.doubleTapRight,
      doubleTap: UiClasses.doubleTap
    };

    const tap = `
      <div class="double-tap-container ${uiClasses.doubleTap} ${uiClasses.doubleTapLeft}" data-tap="left">
        <div class="double-tap-icon-wrap">
          <img src="${this.icons}/fast-forward.svg" class="rot-180" alt="tap-left"> 
          <div>${this.timeTrackOffset || ""}</div>
        </div>
      </div>
      <div class="double-tap-container ${uiClasses.doubleTap} ${uiClasses.doubleTapRight}" data-tap="right">
        <div class="double-tap-icon-wrap">
          <div>${this.timeTrackOffset || ""}</div>
          <img src="${this.icons}/fast-forward.svg" alt="tap-right">  
        </div>
      </div>
  `;

    this.container?.insertAdjacentHTML('beforeend', tap);

    this.unMountList["_doubleTap"]= () =>{
      const tapLeft = this.container?.querySelector(`.${uiClasses.doubleTapLeft}`);
      const tapRight = this.container?.querySelector(`.${uiClasses.doubleTapRight}`);
      tapLeft?.remove();
      tapRight?.remove();
    }

    return {
      remove: this.unMountList["_doubleTap"],
      class: "double-tap-container",
      ui: Object.values(uiClasses),
    };

  }

  protected overlayPlay(): IElementsReturn {
    const className = 'overlay-play';
    const uiClasses = {
      container: UiClasses.videoContainerOverlay,
      btn: UiClasses.videoOverlayBtn,
    };


      const overlay = `
        <div class="${className} ${uiClasses.container}">
            <div class="play-icon ${uiClasses.btn}"></div>
        </div>
      `;

      this.container?.insertAdjacentHTML('beforeend', overlay);


    
    this.unMountList["_overlayPlay"] = () =>{
      const el = this.container?.querySelector(`.${className}`);
      el?.remove();
    }

    return {
      remove: this.unMountList["_overlayPlay"],
      class: className,
      ui: Object.values(uiClasses),
    };
  }

  protected storeTimeBtn(isUnmount?: boolean): IElementsReturn {
    const className =  UiClasses.playToTimeContainer;
    const uiClasses = {
      container: className,
      btn: UiClasses.playToTime,
    };

 
      const btn = `
        <div class="${className}" style="display: ${!this.storeTime ? "none" : "block"}">
            <div class="play-icon ${uiClasses.btn}">start ${this.utils.secondsToHms(this.storeTime).time}</div>
        </div>
      `;

      this.container?.insertAdjacentHTML('beforeend', btn);
      this.unMountList["_storeTimeBtn"] = ()=>{
        const el = this.container?.querySelector(`.${className}`);
        el?.remove();
      };

      return {
        remove: this.unMountList["_storeTimeBtn"],
        class: className,
        ui: Object.values(uiClasses),
      };
  
  }

  controls(container: HTMLDivElement | null): IElementsReturn {
    const className = 'videoPlayerControls';
    const uiClasses = {
      play: UiClasses.play,
      pause: UiClasses.pause,
      fullscreen: UiClasses.fullscreen,
      fullscreenCancel: UiClasses.fullscreenCancel,
      buffer: UiClasses.buffer,
      progress: UiClasses.progress,
      track: UiClasses.track,
      volume: UiClasses.volume,
      rangeVolume: UiClasses.rangeVolume,
      rangeVolumeContainer: UiClasses.volumeProgressContainer,
      videoPlayerControls: UiClasses.videoPlayerControls,
      trackTime: UiClasses.trackTime,
      timeFull: UiClasses.trackTimeFull,
      subtitleItem: UiClasses.subtitleItem,
      cc: UiClasses.subtitleBtn,
    };

    const controls = `
      <div class="video-player-controls ${className}" style="display: none">
        <div class="player-btn-left">
          ${this.play(uiClasses.play, uiClasses.pause)}
        </div>

        ${this.track(uiClasses.track, uiClasses.progress, uiClasses.buffer, uiClasses.trackTime, uiClasses.timeFull)}

        <div class="player-btn-right">
          ${this.subtitles({
            btn: uiClasses.cc,
            cItem: uiClasses.subtitleItem,
            listTrack: UiClasses.subtitleList,
            track: this.subtitlesList,
          })}
          ${this.fullscreen(uiClasses.fullscreen, uiClasses.fullscreenCancel)}
          ${this.volume({ btn: uiClasses.volume, volume: uiClasses.rangeVolume, range: uiClasses.rangeVolumeContainer })}
        </div>
      </div>
    `;

    container?.insertAdjacentHTML('beforeend', controls);

    this.unMountList["_controls"] = ()=>{
      const el = this.container?.querySelector(`.${className}`);
      el?.remove();
    }

    return {
      remove: this.unMountList["_controls"],
      class: className,
      ui: Object.values(uiClasses),
    };
  }

  createUI = (): IVideoPlayerElementsCreate => {
    return {
      controls: this.controls(this.container),
      overlayPLay: this.overlayPlay(),
      doubleTap: this.doubleTap(),
      timeStore: this.storeTimeBtn()
    };
  };
}

export class VideoPlayer {
  private video: HTMLVideoElement | null;
  private videoContainer: HTMLDivElement | null;
  private controlsUI!: IUi;
  private isPlay: boolean = false;
  private isFullScreen: boolean = false;
  private isVolume: boolean = false;
  private navigator = window.navigator;
  private volumeValue: number;
  private iconsFolder: string;
  private subtitles: NodeListOf<HTMLTrackElement> | null;
  private subtitlesIndex: number = -1;
  private isSubtitles: boolean = false;
  private isTrack: boolean = false;
  private ui?: IVideoPlayerUI;
  private timeTrackOffset: number;
  private isMouseHover: boolean = false;
  private unMountObject: { [key: string]: () => void } = {};
  private tapedTwice = false;
  private browser: IBrowser = {browser: "", class: ""}
  private name?: string | undefined;
  private timeStore: number = 0;
  private timeStoreOffset: number; 
  private mX: number = 0;
  private mY: number = 0;
  private utils: IVideoUtils;

  constructor({ videoContainer, iconsFolder, volumeValue, subtitle, timeTrackOffset: timeTrackOffset, videoPlayerUI, storeTimeOffset }: IVideoPlayer) {
    this.videoContainer = document.querySelector(videoContainer);
    this.video = this.videoContainer?.querySelector('video') || null;
    this.volumeValue = volumeValue || IVideoPlayerDefaultConst.volume;
    this.iconsFolder = iconsFolder;
    this.timeTrackOffset = timeTrackOffset || IVideoPlayerDefaultConst.timeTrackOffset;
    this.subtitles = this.video?.querySelectorAll('track') || null;
    this.name = this.video?.dataset.name || this.videoContainer?.dataset.name;
    this.timeStoreOffset = storeTimeOffset || 4;
    this.utils = new VideoUtils();
  
    if (!this.checkError() && this.videoContainer) {
      const container = this.videoContainer;
      this.timeStore = this.getStoreTime().time;
      this.video?.classList.add(UiClasses.video);
      const uiParam: IVideoPlayerUIParam = {
        volumeValue: this.volumeValue,
        icons: this.iconsFolder,
        subtitles: this.subtitles,
        subtitlesInit: subtitle,
        timeTrackOffset: this.timeTrackOffset,
        timeStore: this.timeStore
      } 

      this.ui = videoPlayerUI ? videoPlayerUI(container,uiParam) : new VideoPlayerUI(container,uiParam);
      this.browser = this.utils.userAgent();
      container.classList.add(this.browser.class);

      const uiList = this.ui.createUI();

      Object.keys(uiList).forEach((key: string) => {
        uiList[key].ui.forEach((i: string) => {
          this.controlsUI = { ...this.controlsUI, [i]: container.querySelector('.' + i) };
        });
      });

      if(this.video && this.video.textTracks){
        for (var i = 0; i < this.video.textTracks.length; i++) {
          this.video.textTracks[i].mode = "hidden";
        }
      }
      
    }

    this._onClickControls = this._onClickControls.bind(this);
    this._onChangePip = this._onChangePip.bind(this);
    this._onChangeFullScreen = this._onChangeFullScreen.bind(this);
    this._onChangeProgressVideo = this._onChangeProgressVideo.bind(this);
    this._onChangeVolume = this._onChangeVolume.bind(this);
    this._onEventKeywords = this._onEventKeywords.bind(this);
    this._onMouse = this._onMouse.bind(this);
    this._onTouch = this._onTouch.bind(this);
  }

  get videoElement() {
    return this.video;
  }

  get controls() {
    return this.controlsUI;
  }

  get isVideoPlay() {
    return this.isPlay;
  }

  unMountUI = ():void =>{
    this.ui?.unMount();
  }

  unMountEvent = (): void => {
    for (var key in this.unMountObject) {
      this.unMountObject[key]();
    }
    this.utils.eventRemoveStore(()=> 0);
  }

  unMount = (): void => {
    this.unMountUI();
    this.unMountEvent();
  };

  checkError= (): boolean => {
    if (!this.video) {
      console.error('video selector not found', this.video);
      return true;
    }

    if (!this.videoContainer) {
      console.error('video container selector not found', this.videoContainer);
      return true;
    }

    if (!this.iconsFolder) {
      console.error('not found url to icon field', this.iconsFolder);
      return true;
    }

    if (!this.name) {
      console.error('not found data-name to container', this.name);
      return true;
    }

    return false;
  };
  
  private _onTouch() {
    const tapHandler = (event) => {
        const target= event.target;
        const tap: string = target.dataset.tap;
        if(!this.tapedTwice) {
            this.tapedTwice = true;
            setTimeout( () => { this.tapedTwice = false;}, 300 );
            return false;
        }
        event.preventDefault();
        target.classList.add("tap-active");
        
        setTimeout( () => { 
          target.classList.remove("tap-active")
        }, 500 );
        
        
        
        if(this.video && this.isPlay && tap === "right"){
          this.video.currentTime += this.timeTrackOffset;
        }

        if(this.video && this.isPlay && tap === "left"){
          this.video.currentTime -= this.timeTrackOffset;
        }
     }

     this.controlsUI[UiClasses.doubleTapLeft]?.addEventListener("touchstart", tapHandler);
     this.controlsUI[UiClasses.doubleTapRight]?.addEventListener("touchstart", tapHandler);

     return () => {
        this.controlsUI[UiClasses.doubleTapLeft]?.removeEventListener("touchstart", tapHandler);
        this.controlsUI[UiClasses.doubleTapRight]?.removeEventListener("touchstart", tapHandler);
     }
  }
  private _onMouse() {
    const onmousemove = (e: MouseEvent) => {
      if (this.isVideoPlay) {
        this.mX = e.clientX;
        this.mY = e.clientY;
      }
    };

    const onmouseleave = () => {
      this.isMouseHover = false;
    };

    const onmouseenter = () => {
      this.isMouseHover = true;
    };

    if (this.videoContainer) {
      this.videoContainer.addEventListener('mousemove', onmousemove);
      this.videoContainer.addEventListener('mouseleave', onmouseleave);
      this.videoContainer.addEventListener('mouseenter', onmouseenter);
    }

    return () => {
      this.videoContainer?.removeEventListener('mousemove', onmousemove);
      this.videoContainer?.removeEventListener('mouseleave', onmouseleave);
      this.videoContainer?.removeEventListener('mouseenter', onmouseenter);
    };
  }

  private _onClickControls() {
    const click = (e: MouseEvent) => {
      const event = e.target as HTMLElement;
      const keys = Object.keys(this.controlsUI);
      const controlEvents: IFactoryEvent = {
        [UiClasses.play]: () => {
          this.play();
        },

        [UiClasses.pause]: () => {
          this.pause();
        },

        [UiClasses.fullscreen]: () => {
          if (this.video && this.videoContainer) {
            this.isFullScreen = true;
            const video = this.videoContainer;

            if (video.requestFullscreen) {
              video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
              video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
              video.msRequestFullscreen();
            }
            this.utils.fadeOutIN(UiClasses.fullscreenCancel, UiClasses.fullscreen, FadeTime.fullscreen, this.controlsUI);
          }
        },
        [UiClasses.fullscreenCancel]: () => {
          if (this.video && this.videoContainer) {
            this.isFullScreen = false;
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            }
            this.utils.fadeOutIN(UiClasses.fullscreen, UiClasses.fullscreenCancel, FadeTime.fullscreen, this.controlsUI);
          }
        },
        [UiClasses.volume]: () => {
          this.isVolume = !this.isVolume;
          const volume = this.controlsUI[UiClasses.volumeProgressContainer];

          if (this.isVolume) {
            volume &&
            this.utils.fadeIn({
                el: volume,
                display: 'flex',
                time: FadeTime.volume,
              });
          } else {
            volume &&
            this.utils.fadeOut({
                el: volume,
                time: FadeTime.volume,
              });
          }
        },
        [UiClasses.track]: (event) => {
          const track = this.videoContainer?.querySelector('.' + UiClasses.track) as HTMLDivElement;
          const posX = event.offsetX;
          if (this.video) {
            if (!this.isPlay) {
              this.utils.fadeOutIN(UiClasses.pause, UiClasses.play, FadeTime.controls, this.controlsUI);
            }
            this.isTrack = true;
            this.video.pause();
            this.video.currentTime = (this.video.duration * posX) / track.offsetWidth;
            this.setStoreTime(this.video.currentTime);
            this.video.play();
          }
        },
        [UiClasses.videoOverlayBtn]: () => {
          this.utils.eventStoreDispatch();
          this.video?.play();
          this.setStoreTime(this.video?.currentTime || 0);
        },
        [UiClasses.subtitleItem]: (e) => {
          const el = e.target as HTMLElement;
          const lang = el.dataset.lang || 'off';

          if (this.video && this.videoContainer) {
            const oldEl = this.videoContainer.querySelector('.' + UiClasses.subtitleItem + '.active');
            const video = this.video;
            oldEl?.classList.remove('active');
            el.classList.add('active');

            if (lang === 'off') {
              if (this.subtitlesIndex !== -1) this.video.textTracks[this.subtitlesIndex].mode = 'disabled';
              this.subtitlesIndex = -1;
            } else {
              if (this.subtitlesIndex !== -1) this.video.textTracks[this.subtitlesIndex].mode = 'disabled';

              const key = Object.values(video.textTracks).findIndex((x) => x.language === lang);
              video.textTracks[key].mode = 'showing';
              this.subtitlesIndex = key;
            }
            const list = this.videoContainer.querySelector('.' + UiClasses.subtitleList);
            if (list) {
              this.isSubtitles = false;
              this.utils.fadeOut({ el: list as HTMLElement, time: FadeTime.subtitle });
            }
          }
        },
        [UiClasses.subtitleBtn]: () => {
          const list = this.videoContainer?.querySelector('.' + UiClasses.subtitleList) as HTMLElement;
          this.isSubtitles = !this.isSubtitles;

          if (this.isSubtitles) {
            this.utils.fadeIn({ el: list, time: FadeTime.subtitle });
          } else {
            this.utils.fadeOut({ el: list as HTMLElement, time: FadeTime.subtitle });
          }
        },
        [UiClasses.playToTimeContainer]: ()=>{
          this.playTo(this.timeStore);
        }
      };

      if (event.matches('.' + UiClasses.video)) {
        this.video?.pause();
        return 0;
      }
      const keysLength = keys.length
      for (let i = 0; i < keysLength; i++) {
        if (event.matches('.' + keys[i]) && typeof controlEvents[keys[i]] !== 'undefined') {
          const el = this.controlsUI[keys[i]];
          el && controlEvents[keys[i]](e, el);
          return 0;
        }
      }
    };

    this.videoContainer?.addEventListener('click', click, false);

    return () => {
      this.videoContainer?.removeEventListener('click', click, false);
    };
  }

  private _onChangePip() {
    const video = this.video as HTMLVideoElement;

    const onEnterpictureinpicture = () => {
      video.pause();
      this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, FadeTime.controls, this.controlsUI);
    };
    const onLeavepictureinpicture = () => {
      video.pause();
      this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, FadeTime.controls, this.controlsUI);
    };

    if (document.pictureInPictureEnabled) {
      video.addEventListener('enterpictureinpicture', onEnterpictureinpicture, false);
      video.addEventListener('leavepictureinpicture', onLeavepictureinpicture, false);

      if (this.navigator) {
        //@ts-ignore
        this.navigator.mediaSession.setActionHandler('pause', () => {
          video.pause();
          this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, FadeTime.controls, this.controlsUI);
        });
        //@ts-ignore
        this.navigator.mediaSession.setActionHandler('play', () => {
          video.play();
          this.utils.fadeOutIN(UiClasses.pause, UiClasses.play, FadeTime.controls, this.controlsUI);
        });
      }
    }

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterpictureinpicture, false);
      video.removeEventListener('leavepictureinpicture', onLeavepictureinpicture, false);
    };
  }

  private _onChangeFullScreen() {
    const onfullscreenchange = () => {
      if (this.isFullScreen) {
        this.isFullScreen = false;
        this.utils.fadeOutIN(UiClasses.fullscreenCancel, UiClasses.fullscreen, FadeTime.fullscreen, this.controlsUI);
      } else {
        this.isFullScreen = true;
        this.utils.fadeOutIN(UiClasses.fullscreen, UiClasses.fullscreenCancel, FadeTime.fullscreen, this.controlsUI);
      }
    };

    if (this.video && this.videoContainer) {
      switch (this.browser.browser) {
        case Browser.moz:
          this.videoContainer.addEventListener('mozfullscreenchange', onfullscreenchange);
          break;
        default:
          this.videoContainer.addEventListener('webkitfullscreenchange', onfullscreenchange);
          this.videoContainer.addEventListener('fullscreenchange', onfullscreenchange);
      }
    }

    return () => {
      switch (this.browser.browser) {
        case Browser.moz:
          this.videoContainer?.removeEventListener('mozfullscreenchange', onfullscreenchange);
          break;
        default:
          this.videoContainer?.removeEventListener('webkitfullscreenchange', onfullscreenchange);
          this.videoContainer?.removeEventListener('fullscreenchange', onfullscreenchange);
      }
    };
  }

  private _onChangeProgressVideo() {
    const video = this.video as HTMLVideoElement;

    const videoEnd = () => {
      this.isPlay = false;
      video.pause();
      video.currentTime = 0;
      this.removeStoreTime();
      this.utils.fadeOutIN(UiClasses.videoContainerOverlay, UiClasses.videoPlayerControls, 40, this.controlsUI, {
        callback: () => {
          this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, 0, this.controlsUI);
        },
        display: 'flex',
      });
    };

    const videoStart = () => {
      this.isPlay = true;
      this.utils.fadeOutIN(UiClasses.pause, UiClasses.play, FadeTime.controls, this.controlsUI);
      this.utils.fadeOut({
        el: this.controlsUI[UiClasses.playToTimeContainer] as HTMLDivElement,
        time: FadeTime.controls
      });
      if (!this.isTrack) this.utils.fadeOutIN(UiClasses.videoPlayerControls, UiClasses.videoContainerOverlay, 40, this.controlsUI, { display: 'flex' });
      this.isTrack = false;
    };

    const timeupdate = () => {
      const duration = video.duration;
      if (duration > 0) {
        const progressUI = this.controlsUI[UiClasses.progress];
        const timeUI = this.controlsUI[UiClasses.trackTime];
        if (progressUI) progressUI.style.width = (video.currentTime / duration) * 100 + '%';
        if (timeUI) timeUI.innerText = this.utils.secondsToHms(video.currentTime).time;
        if(video.currentTime > this.timeStore + this.timeStoreOffset) this.setStoreTime(video.currentTime)
      }
    };

    const progress = () => {
      const duration = video.duration;
      if (duration > 0) {
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
            const bufferUI = this.controlsUI[UiClasses.buffer];
            if (bufferUI) bufferUI.style.width = (video.buffered.end(video.buffered.length - 1 - i) / duration) * 100 + '%';
            break;
          }
        }
      }
    };

    const loadedmetadata = () => {
      const timeFullUI = this.controlsUI[UiClasses.trackTimeFull];
      if (timeFullUI) timeFullUI.innerText = this.utils.secondsToHms(video.duration).time;
    };

    const videoPause = () => {
      if (!this.isTrack) {
        this.utils.fadeOutIN(UiClasses.videoContainerOverlay, UiClasses.videoPlayerControls, 40, this.controlsUI, {
          callback: () => {
            this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, 0, this.controlsUI);
          },
          display: 'flex',
        });
      }
    };

    if (this.video) {
      video.addEventListener('progress', progress, false);
      video.addEventListener('timeupdate', timeupdate, false);
      video.addEventListener('ended', videoEnd, false);
      video.addEventListener('play', videoStart, false);
      video.addEventListener('pause', videoPause, false);
      video.addEventListener('loadedmetadata', loadedmetadata, false);
    }

    return () => {
      video.removeEventListener('ended', videoEnd, false);
      video.removeEventListener('progress', progress, false);
      video.removeEventListener('timeupdate', timeupdate, false);
      video.removeEventListener('play', videoStart, false);
      video.removeEventListener('pause', videoPause, false);
      video.addEventListener('loadedmetadata', loadedmetadata, false);
    };
  }

  private _onEventKeywords() {
    const keyDown = (event)=>{
        if(event.keyCode == 32 && event.target == document.body && this.video && this.isMouseHover) {
          event.preventDefault();
        }
    }
    const keyUp = (event) => {
      if (this.video && this.isMouseHover) {
        switch (event.which) {
          case 32: //space
            if (this.isPlay) {
              this.isPlay = false;
              this.video.pause();
            } else {
              this.isPlay = true;
              this.utils.eventStoreDispatch();
              this.video.play();
            }
            this.setStoreTime(this.video?.currentTime || 0)
            break;
          case 37: // <
            if (this.isPlay) {
              this.video.currentTime -= this.timeTrackOffset;
            }
            break;
          case 39: // >
            if (this.isPlay) {
              this.video.currentTime += this.timeTrackOffset;
            }
            break;
          default:
            return 0;
        }
      }
    };
    if (this.video) {
      document.addEventListener('keyup', keyUp);
      document.addEventListener('keydown', keyDown);
    }

    return () => {
      document.removeEventListener('keyup', keyUp);
      document.removeEventListener('keydown', keyDown);
      this.isMouseHover = false;
    };
  }

  private _onChangeVolume() {
    const range = this.controlsUI[UiClasses.rangeVolume];
    const volume = (e: any) => {
      const label = this.videoContainer?.querySelector('.' + UiClasses.labelValue) as HTMLDivElement;
      const target = e.target as HTMLInputElement;
      const video = this.video;

      label.textContent = target.value + '%';
      if (video) video.volume = parseInt(target.value) / 100;
    };

    if (this.video && range) {
      range.addEventListener('input', volume, false);
    }

    return () => {
      range?.removeEventListener('input', volume, false);
    };
  }
  private setStoreTime = (time: number) =>{
    this.timeStore = time;
    localStorage.setItem(PlayerKey.storeInfoPrev, localStorage.getItem(PlayerKey.storeInfo) || "not found");
    localStorage.setItem(PlayerKey.storeInfo, JSON.stringify({name: this.name, time}));
  }
  private removeStoreTime = () =>{
    localStorage.removeItem(PlayerKey.storeInfo);
    localStorage.removeItem(PlayerKey.storeInfoPrev);
    this.timeStore = 0;
  }

  private getStoreTime = (): IPlayerStoreTime =>{
    const store = localStorage.getItem(PlayerKey.storeInfo);

    if(store){
      const parse = JSON.parse(store);

      if(this.name === parse.name){
        return parse;
      }
    }

    return {
      name: this.name || "",
      time: 0
    }
  }

  play = () =>{
    this.isPlay = true;
    this.utils.fadeOutIN(UiClasses.pause, UiClasses.play, FadeTime.controls, this.controlsUI);
    this.video?.play();
    this.setStoreTime(this.video?.currentTime || 0);
  }

  playTo = (time: number) =>{
    if(this.video){
      this.isPlay = true;
      this.video.currentTime = time;
      this.utils.fadeOutIN(UiClasses.pause, UiClasses.play, FadeTime.controls, this.controlsUI);
      this.utils.fadeOut({
        el: this.controlsUI[UiClasses.playToTimeContainer] as HTMLDivElement,
        time: FadeTime.controls
      })
      this.video.play();
      if(time !== this.timeStore)
        this.setStoreTime(time);
    }

  }  

  pause = () =>{
    this.isPlay = false;
    //TODO: Вернуть если нет overlay
    // this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, FadeTime.controls, this.controlsUI);
    this.video?.pause();
    this.setStoreTime(this.video?.currentTime || 0);    
  }

  stop = () =>{
    this.isPlay = false;
    //TODO: Вернуть если нет overlay
    //this.utils.fadeOutIN(UiClasses.play, UiClasses.pause, FadeTime.controls, this.controlsUI);
    if(this.video){
     this.video.pause(); 
     this.video.currentTime = 0;
     this.removeStoreTime();
    }  
  }

  playerInit = () => {
    if (!this.checkError() && this.video) {
      this.unMountObject['_onClickControls'] = this._onClickControls();
      this.unMountObject['_onChangePip'] = this._onChangePip();
      this.unMountObject['_onChangeFullScreen'] = this._onChangeFullScreen();
      this.unMountObject['_onChangeProgressVideo'] = this._onChangeProgressVideo();
      this.unMountObject['_onChangeVolume'] = this._onChangeVolume();
      this.unMountObject['_onEventKeywords'] = this._onEventKeywords();
      this.unMountObject['_onMouse'] = this._onMouse();
      this.unMountObject['_onTouch'] = this._onTouch();
      this.video.volume = this.volumeValue / 100;
    }
  };
}

interface IVideoUtils{
  fadeIn: (value: IFade) => void;
  fadeOut: (value: IFade) => void;
  userAgent: () => IBrowser;
  fadeOutIN:(
    showClassEl: string,
    hideClassEl: string,
    time: number,
    controlsUI: IUi,
    param?: {
      callback?: () => void;
      display?: string;
    }) => void;
  secondsToHms: (d: number) => {
    h: number,
    m: number,
    s: number,
    time: string,
  };
  eventStoreDispatch: ()=> void;
  eventChangeStor:  (callback: (e)=> void ) => void;
  eventRemoveStore: (callback: (e) => void) => void;
}
export class VideoUtils implements IVideoUtils {

  private navigator = window.navigator;
  private event;

  constructor(){
    this.event = new Event(PlayerKey.storeInfo);
  }

  get storeKey(){
    return PlayerKey.storeInfo;
  }

  fadeIn({ el, display = 'block', time = 10, callback }: IFade) {
    el.style.opacity = '0';
    el.style.display = display || 'block';

    (function fade() {
      var val: number = parseFloat(el.style.opacity);
      if ((val += time / 1000) < 1.01) {
        el.style.opacity = val.toString();
        requestAnimationFrame(fade);
      } else {
        if (callback !== undefined) {
          callback();
        }
      }
    })();
  }

  fadeOut({ el, time = 10, callback = undefined }: IFade) {
    el.style.opacity = '1';
    (function fade() {
      //@ts-ignore
      if ((el.style.opacity -= time / 1000) < 0) {
        el.style.display = 'none';
        if (callback !== undefined) {
          callback();
        }
      } else {
        requestAnimationFrame(fade);
      }
    })();
  }

  fadeOutIN(
    showClassEl: string,
    hideClassEl: string,
    time: number,
    controlsUI: IUi,
    param?: {
      callback?: () => void;
      display?: string;
    }
  ) {
    const el = controlsUI[hideClassEl];
    const elShow = controlsUI[showClassEl];
    const callback = param?.callback;

    el &&
      this.fadeOut({
        el,
        time,
        callback: () => {
          elShow && this.fadeIn({ el: elShow, display: param?.display || 'block', time, callback });
        },
      });
  }

  userAgent = (): IBrowser => {
    let sBrowser = Browser.unknown;
    let cBrowser = 'br-unknown';

    const sUsrAg = this.navigator.userAgent;

    if (sUsrAg.indexOf('Firefox') > -1) {
      sBrowser = Browser.moz;
      cBrowser = 'br-moz';
    } else if (sUsrAg.indexOf('Opera') > -1) {
      sBrowser = Browser.opera;
      cBrowser = 'br-opera';
    } else if (sUsrAg.indexOf('Trident') > -1) {
      sBrowser = Browser.ie;
      cBrowser = 'br-ie';
    } else if (sUsrAg.indexOf('Edge') > -1) {
      sBrowser = Browser.edge;
      cBrowser = 'br-edge';
    } else if (sUsrAg.indexOf('Chrome') > -1) {
      sBrowser = Browser.google;
      cBrowser = 'br-chrome';
    } else if (sUsrAg.indexOf('Safari') > -1) {
      sBrowser = Browser.safari;
      cBrowser = 'br-safari';
    }

    return { browser: sBrowser, class: cBrowser };
  };

  secondsToHms(d: number) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    const zero = (a: number) => {
      return a > 9 ? a : '0' + a;
    };
    return {
      h,
      m,
      s,
      time: `${zero(m)}:${zero(s)}`,
    };
  }

  eventStoreDispatch(){
    this.event.detail = localStorage.getItem(PlayerKey.storeInfoPrev)
    window.dispatchEvent(this.event);
  }

  eventChangeStor(callback: (e) => void){
    window.addEventListener(PlayerKey.storeInfo, function (e) {
      callback(e);
    }, false);
  }
  eventRemoveStore(callback: (e) => void){
    window.removeEventListener(PlayerKey.storeInfo,function (e) {
      callback(e);
    }, false)
  }

}

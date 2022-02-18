import './style.sass';
import {  VideoPlayer, VideoUtils} from './app/index';

/*
* Init default video 
*/
/*
const video = new VideoPlayer({
  videoContainer: '.player-container',
  iconsFolder: './assets/images/icons',
  volumeValue: 50,
  subtitle: true,
  timeTrackOffset: 2,
});

video.playerInit();

*/

/*
* 
*init loop
*
*/

interface IStackVideo{
  [key: string]: VideoPlayer
}

const videoStack: IStackVideo = {};
const videoList = document.querySelectorAll(".video-list .player-container");
const utils = new VideoUtils();

videoList.forEach((item)=>{

  const videoSubtitles = item.querySelectorAll("video track"); 
  const itemElement = item as HTMLDivElement
  const videoPlayer = new VideoPlayer({
    videoContainer: `.${
      // @ts-ignore
      itemElement.dataset.name
    }`,
    iconsFolder: './assets/images/icons',
    volumeValue: 30,
    subtitle: !!videoSubtitles.length,
    timeTrackOffset: 2
  });

  videoPlayer.playerInit();
  // @ts-ignore
  videoStack[itemElement.dataset.name || "unknown"]= videoPlayer;

});

utils.eventChangeStor(function(e){
  const info = localStorage.getItem(utils.storeKey);
  if(info && e.detail !== info){
    const data = JSON.parse(info)
    videoStack[data.name].pause();
  }
})
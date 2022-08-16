import React, {useState, useLayoutEffect} from 'react';
import PdfViewer from "./PdfViewer";
import VideoPlayer from './Video';
import MenuIcon from '../assets/images/menu.svg';
import ReturnIcon from '../assets/images/back_arrow.svg';
import LeftIcon from '../assets/images/left.svg';
import RightIcon from '../assets/images/right.svg';
import CloseIcon from '../assets/images/close.svg';
import GlossaryIcon from '../assets/images/glossary.svg';
import ReferencesIcon from '../assets/images/references.svg';
import GlossaryGreenIcon from '../assets/images/glossary_green.svg';
import ReferencesGreenIcon from '../assets/images/references_green.svg';
import RotateGif from '../assets/images/rotate_device.gif';
import ChaptersList from './ChaptersList';
import ExteriorIcon from '../assets/images/exterior.png';
import InteriorIcon from '../assets/images/interior.png';
import RotateIcon from '../assets/images/rotate.png';

// content
import videos from '../assets/videos/video-data.json';

let currentAngle = 0; // needs to be global
let exteriorMode = true;

const VideoElement = () => {

    let video;
    let tick;
    let browserDelay;
    let videoProgress = videos[0].chapters;
    let currentPopup = 0;
    
    const [singlePopups, setSinglePopups] = useState(false);
    // const [multiPopups, setMultiPopups] = useState(false);
    const [popupImage, setPopupImage] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [popupIncrement, setPopupIncrement] = useState(0);
    const [arrayAnglesState, setArrayAnglesState] = useState(null);
    const [rotateDisabled, setRotateDisabled] = useState(false);
    const [exteriorDisabled, setExteriorDisabled] = useState(true);
    const [interiorDisabled, setInteriorDisabled] = useState(false);

    let contentData = videos[0].chapters[currentChapter].sections[popupIncrement];

    // show of hide warning message
    const [warningDismissed, setWarningState] = useState(false);
    const [warningVisible, setWarningVisible] = useState(false);
    const hideWarning = () => {
      setWarningVisible(false);
      setWarningState(true);
    }
    const showWarning = () => {
      setWarningVisible(true)
    }

    const [startVisible, setStartVisible] = useState(true);
    const startVideo = () => {
      setStartVisible(false);
      video.play();
    }

    useLayoutEffect(() => {

      // detect current browser type to adjust for timeupdate event
      // const ua = navigator.userAgent.toLowerCase(); 
      // if (ua.indexOf('safari') !== -1) { 
      //   if (ua.indexOf('chrome') > -1) {
      //     // Chrome
      //     browserDelay = 4;
      //   } else {
      //     // Safari
      //     browserDelay = 8;
      //   }
      // } else {
      //   browserDelay = 4;
      // }

      browserDelay = 4; // safari seems to have updated..?

      // console.log("browserDelay", browserDelay)

      video = document.querySelector('video');

      if (!startVisible) {

        let arrayChapters = [];
        let arraySections = [];
        let arrayAngles = [];

        const chapters = videos[0].chapters;

        for (let i = 0; i < chapters.length; i++) {

          const chapterTimes = chapters[i];
          let chapterTime = breakdownTime(chapterTimes.start);
          chapterTime = chapterTime * browserDelay; // 250ms workaround
          chapterTime = Math.floor(chapterTime);
          let chapterTimeEnd = breakdownTime(chapterTimes.end);
          chapterTimeEnd = chapterTimeEnd * browserDelay; // 250ms workaround
          chapterTimeEnd = Math.floor(chapterTimeEnd);
          arrayChapters.push(chapterTime, chapterTimeEnd);

          const sections = chapters[i].sections;

          for (let x = 0; x < sections.length; x++) {

            const times = sections[x];
            let time = breakdownTime(times.start);
            time = time * browserDelay; // 250ms workaround
            time = Math.floor(time);
            let timeEnd = breakdownTime(times.end);
            timeEnd = timeEnd * browserDelay; // 250ms workaround
            timeEnd = Math.floor(timeEnd);
            arraySections.push(time, timeEnd);

            
            if (times.popups === 0) {
              setArrayAnglesState(times.popupContent)

              for (let a = 0; a < times.popupContent.length; a++) {

                const angles = times.popupContent[a];
                let angleStart = breakdownTime(angles.start);
                angleStart = angleStart * browserDelay // 250ms workaround
                angleStart = Math.floor(angleStart);
                let angleEnd = breakdownTime(angles.end);
                angleEnd = angleEnd * browserDelay // 250ms workaround
                angleEnd = Math.floor(angleEnd);
                arrayAngles.push(angleStart, angleEnd);
                
              }
            }

          }

        }

        // console.log("arrayChapters:", arrayChapters)
        // console.log("arraySections:", arraySections)
        // console.log("arrayAngles:", arrayAngles)


        video.addEventListener('timeupdate', function() {

          // if (learnButtonVisible) {
          //   hideLearnButton();
          // } else if (threeDControlsVisible) {
          //   hide3DControls();
          // } 

          tick = (video.currentTime * browserDelay);
          tick++;

          tick = Math.floor(tick);
          // console.log("tick", tick)
          // console.log("currentChapter", currentChapter)

          // if ((arraySections.includes(tick) || arrayChapters.includes(tick)) && tick !== 0) {
          if (arraySections.includes(tick) || arrayChapters.includes(tick) || arrayAngles.includes(tick)) {

            for (let i = 0; i < videos[0].chapters.length; i++) {

              const chapter = videos[0].chapters[i];

              let chapterNewTime = breakdownTime(chapter.start)
              chapterNewTime = chapterNewTime * browserDelay; // 250ms workaround

              if (tick === chapterNewTime) {
                // SET ACTIVE MENU ITEM
                setCurrentChapter(i);
                setPopupIncrement(0);
                currentPopup = 0;
                // console.log("popupIncrement", popupIncrement)
              }

              let chapterEndTime = breakdownTime(chapter.end)
              chapterEndTime = chapterEndTime * browserDelay // 250ms workaround
              
              if (tick === chapterEndTime) {
                // console.log("End of chapter", i + 1)
                setChapterIndicator(i + 1);
                window.parent.GetPlayer().SetVar("chapterFinished", i + 1)
                // the above may cause errors and will cause a bug if not integrated into the LMS - error below
                // Uncaught TypeError: Cannot read property 'popupContent' of undefined
              }

              for (let x = 0; x < chapter.sections.length; x++) {

                const section = chapter.sections[x];
                let popups = section.popups;

                let secondsTime = breakdownTime(section.start)
                secondsTime = secondsTime * browserDelay; // 250ms workaround

                if (tick === secondsTime) {
                  // video.pause();

                  // POPUP ACTION HERE
                  if (popups === 1) {
                    hide3DControls();
                    showLearnButton();
                  } else {
                    hideLearnButton();
                    show3DControls();
                  } 

                }

                let secondsEndTime = breakdownTime(section.end)
                secondsEndTime = secondsEndTime * browserDelay; // 250ms workaround

                if (tick === secondsEndTime) {

                  if (chapter.sections.length > 1 && currentPopup === 0) {
                    setPopupIncrement(x + 1);
                    currentPopup = x + 1;
                    // console.log("popupIncrement", popupIncrement)
                  }

                  // POPUP ACTION HERE
                  if (popups === 1) {
                    hideLearnButton();
                  } else {
                    hide3DControls();
                  }

                }

                
                if (section.popups === 0) {
                  for (let a = 0; a < section.popupContent.length; a++) {

                    const angle = section.popupContent[a];
                    // console.log("angle", angle)

                    let angleStartTime = breakdownTime(angle.start)
                    angleStartTime = angleStartTime * browserDelay; // 250ms workaround

                    if (tick === angleStartTime) {
                      // currentAngle++;
                      video.pause();
                      setRotateDisabled(false);
                    }

                    let angleEndTime = breakdownTime(angle.end)
                    angleEndTime = angleEndTime * browserDelay; // 250ms workaround

                    if (tick === angleEndTime) {
                      
                      // if internal else if external
                      if (currentAngle === 4 && exteriorMode) {
                        currentAngle = 0;
                      } else if (currentAngle === 8) {
                        currentAngle = 4;
                        video.pause();
                        setRotateDisabled(false);
                      }
                      
                      // currentAngle++;
                    }

                  }
                }

              }
            }

          }

        }, false);

      }

    }, [startVisible]);

    useLayoutEffect(() => {

      // get video element
      video = document.querySelector('video');

      // display warning
      if ((window.innerHeight > window.innerWidth) && !warningDismissed) {
        showWarning();
      }

      // action after video ends
      video.addEventListener('ended', () => window.parent.GetPlayer().SetVar("videoFinished", true), false);

    });

    // check for window resizing to display warning or not
    if ('onresize' in window) {
      window.addEventListener("resize", function() {
        if (window.innerHeight > window.innerWidth) {
            showWarning();
        } else {
            hideWarning();
        }
      }, false);
    }

    const [videoProgressState, setVideoProgressState] = useState(videoProgress);

    const setChapterIndicator = (id) => {
      // console.log("id", id)

      const newList = videoProgress.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            progress: !item.progress,
          };
          return updatedItem;
        }

        return item;
      });
   
      // setVideoProgress(newList);
      videoProgress = newList;
      setVideoProgressState(videoProgress);

    }

    const rotateSection = () => {
      video.play();
      
      if (currentAngle < arrayAnglesState.length) {
        video.currentTime = breakdownTime(arrayAnglesState[currentAngle].start);
        currentAngle++;
      }
      console.log(currentAngle)
      setRotateDisabled(true);
    }

    const exteriorView = () => {
      exteriorMode = true;
      if (currentAngle === 4) {
        currentAngle = 0;
      } else {
        currentAngle = currentAngle - 5;
      }
      setExteriorDisabled(true);
      setInteriorDisabled(false);
      setRotateDisabled(true);
      video.play();
      if (currentAngle < arrayAnglesState.length) {
        video.currentTime = breakdownTime(arrayAnglesState[currentAngle].start);
        currentAngle++;
        console.log(currentAngle)
      }
    }

    const interiorView = () => {
      exteriorMode = false;
      if (currentAngle === 0) {
        currentAngle = 4;
      } else {
        currentAngle = currentAngle + 3;
      }
      setExteriorDisabled(false);
      setInteriorDisabled(true);
      setRotateDisabled(true);
      video.play();
      if (currentAngle < arrayAnglesState.length) {
        video.currentTime = breakdownTime(arrayAnglesState[currentAngle].start);
        currentAngle++;
        console.log(currentAngle)
      }
    }

    // rotate config reset
    const resetRotation = () => {
      currentAngle = 0;
      exteriorMode = true;
      setExteriorDisabled(true);
      setInteriorDisabled(false);
    }

    const nextChapter = () => {
      // functionality for if videos are paused when popup displays
      if (learnButtonVisible) {
        hideLearnButton();
      } else if (threeDControlsVisible) {
        hide3DControls();
      } 
      
      if (currentChapter < videos[0].chapters.length && currentChapter !== (videos[0].chapters.length - 1)) {
        setCurrentChapter(currentChapter + 1);
        jumpToChapter(videos[0].chapters[currentChapter + 1].start)
      }
      
    }
    const prevChapter = () => {
      if (learnButtonVisible) {
        hideLearnButton();
      } else if (threeDControlsVisible) {
        hide3DControls();
      } 
      
      if (currentChapter > 0) {
        if ((breakdownTime(videos[0].chapters[currentChapter].start) + 3) >= video.currentTime) {
          setCurrentChapter(currentChapter - 1);
          jumpToChapter(videos[0].chapters[currentChapter - 1].start)
        } else {
          setCurrentChapter(currentChapter);
          jumpToChapter(videos[0].chapters[currentChapter].start)
        }
      } else if (breakdownTime(videos[0].chapters[0].start) !== 0) {
        jumpToChapter("00:00:000")
      }
      
    }

    // open and close menu
    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => {
      setMenuVisible(true);

      hideMenuButton();
      hidePlaybackButtons();

      video.pause();
    }
    const closeMenu = () => {
      setMenuVisible(false);

      showMenuButton();
      showPlaybackButtons();
      
      if (rotateDisabled) {
        video.play();
      }
    }

    // open and close references
    const [referencesVisible, setReferencesVisible] = useState(false);
    const openReferences = () => {
      setReferencesVisible(true);
      if (menuVisible) {
        setMenuVisible(false);
      }
      if (!returnButtonVisible) {
        showReturnButton();
      }
    }
    const closeReferences = () => {
      setReferencesVisible(false);
      if (!menuVisible) {
        setMenuVisible(true);
      }
      if (returnButtonVisible) {
        hideReturnButton();
      }
    }

    // open and close glossary
    const [glossaryVisible, setGlossaryVisible] = useState(false);
    const openGlossary = () => {
      setGlossaryVisible(true);
      if (menuVisible) {
        setMenuVisible(false);
      }
      if (!returnButtonVisible) {
        showReturnButton();
      }
    }
    const closeGlossary = () => {
      setGlossaryVisible(false);
      if (!menuVisible) {
        setMenuVisible(true);
      }
      if (returnButtonVisible) {
        hideReturnButton();
      }
    }

    // open and close learn more
    const [learnVisible, setLearnVisible] = useState(false);
    const toggleLearn = (num) => {
      if (learnVisible) {
        setLearnVisible(false);
      
        showMenuButton();
        showPlaybackButtons();
        showLearnButton();
        if (returnButtonVisible) {
          hideReturnButton();
        }
        
        setSinglePopups(false);
        video.play();
      } else {
        setPopupImage(num)
        setLearnVisible(true);
      
        hideMenuButton();
        hidePlaybackButtons();
        hideLearnButton();
        if (!returnButtonVisible) {
          showReturnButton();
        }
  
        setSinglePopups(true);
        video.pause();
      }
      
    }

    // const toggleLearnMulti = (num) => {
      
    //   if (learnVisible) {
    //     setLearnVisible(false);
      
    //     showMenuButton();
    //     showPlaybackButtons();
    //     show3DControls();
    //     if (returnButtonVisible) {
    //       hideReturnButton();
    //     }

    //     setMultiPopups(false);
    //     video.play();
        
    //   } else {
    //     setPopupImage(num)
    //     setLearnVisible(true);
      
    //     hideMenuButton();
    //     hidePlaybackButtons();
    //     hide3DControls();
    //     if (!returnButtonVisible) {
    //       showReturnButton();
    //     }
  
    //     setMultiPopups(true);
    //     video.pause();
    //   }
      
    // }

    // return to main screen
    const returnMain = () => {
      if (referencesVisible) {
        closeReferences();
      }
      if (glossaryVisible) {
        closeGlossary();
      }
      if (learnVisible && singlePopups) {
        toggleLearn();
      } 
      // else if (learnVisible && multiPopups) {
      //   toggleLearnMulti();
      // }
    }

    // show of hide menu button
    const [menuButtonVisible, setMenuButtonVisible] = useState(true);
    const hideMenuButton = () => {
      setMenuButtonVisible(false);
    }
    const showMenuButton = () => {
      setMenuButtonVisible(true)
    }

    // show of hide return button
    const [returnButtonVisible, setReturnButtonVisible] = useState(false);
    const hideReturnButton = () => {
      setReturnButtonVisible(false);
    }
    const showReturnButton = () => {
      setReturnButtonVisible(true)
    }

    // show of hide learn button
    const [learnButtonVisible, setLearnButtonVisible] = useState(false);
    const hideLearnButton = () => {
      setLearnButtonVisible(false);
    }
    const showLearnButton = () => {
      setLearnButtonVisible(true)
    }

    // show of hide learn button
    const [threeDControlsVisible, setThreeDControlsVisible] = useState(false);
    const hide3DControls = () => {
      setThreeDControlsVisible(false);
    }
    const show3DControls = () => {
      setThreeDControlsVisible(true)
    }

    // show of hide playback buttons
    const [playbackButtonsVisible, setPlaybackButtonsVisible] = useState(true);
    const hidePlaybackButtons = () => {
      setPlaybackButtonsVisible(false);
    }
    const showPlaybackButtons = () => {
      setPlaybackButtonsVisible(true)
    }

    const jumpToChapter = (time, chapter) => {

      resetRotation();

      setPopupIncrement(0);
      currentPopup = 0;

      if (chapter !== undefined) {
        setCurrentChapter(chapter);
      }
      // console.log("currentChapter", currentChapter)

      if (menuVisible) {
        closeMenu();
      }

      if (learnButtonVisible) {
        hideLearnButton();
      } else if (threeDControlsVisible) {
        hide3DControls();
      } 

      video.currentTime = breakdownTime(time);
      
      video.play();

    }

    const breakdownTime = (start) => {
      let time = start.split(':');
      let min = time[0];
      let sec = time[1];
      min = min * 60;
      time = parseFloat(min) + parseFloat(sec);
      return time;
    }

    const videoJsOptions = {
      autoplay: false,
      controls: true,
      sources: [{
        src: `./assets/${videos[0].video}`,
        type: 'video/mp4'
      }],
      userActions: {
        doubleClick: false
      },
      controlBar: {
        fullscreenToggle: false
      }
    }

    const StartScreen = () => (
      <div className="start-background">
        <div className="start-text">
          <h1>{videos[0].title}</h1>
          <div className="start-description">{videos[0].description}{videos[0].description_extended !== "" ? ":" : ""} <span className="start-intro">{videos[0].description_extended}</span></div>
        </div>
        <div className="start-action">
          <button onClick={startVideo} className="start-button">Start Learning Module</button>
        </div>
      </div>
    )
  
    const Menu = () => (
      <div className="menu-background">
        <div className="menu-element">
          <div className="menu-content">
            <div className="menu-header">
              <h1>{videos[0].title}</h1>
              <p>{videos[0].subtitle}</p>
            </div>
            {/* <h3>Menu</h3>
            <ul className="menu-nav">
              <li><button onClick={openReferences}><img src={ReferencesIcon} alt="" />References</button></li>
              <li><button onClick={openGlossary}><img src={GlossaryIcon} alt="" />Glossary</button></li>
            </ul> */}
            <h3>KAPITEL</h3>
            <ChaptersList 
              video={videos[0]}
              jump={jumpToChapter}
              breakdown={breakdownTime}
              progress={videoProgressState}
            />
          </div>
          <button onClick={closeMenu} className="close-button">
            <div className="close-button-content">
              <img src={CloseIcon} className="close-icon" alt="Menu" />
              <span className="close-text">Close</span>
            </div>
          </button>
        </div>
      </div>
    )

    // const References = () => (
    //   <div className="content-background">
    //     <div className="container">
    //       <div className="content-flex">
    //         <div className="content-element">
    //           <div className="content-title">
    //             <img src={ReferencesGreenIcon} alt="" />
    //             <h1>References</h1>
    //           </div>
    //           <div className="content-content">
    //             {/* <PdfViewer pdf={`../assets/${videos[0].references}`} /> */}
    //             <iframe src={`../assets/${videos[0].references}`}></iframe>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // )
  
    // const Glossary = () => (
    //   <div className="content-background">
    //     <div className="container">
    //       <div className="content-flex">
    //         <div className="content-element">
    //           <div className="content-title">
    //             <img src={GlossaryGreenIcon} alt="" />
    //             <h1>Glossary of terms</h1>
    //           </div>
    //           <div className="content-content">
    //             {/* <PdfViewer pdf={`../assets/${videos[0].glossary}`} /> */}
    //             <iframe src={`../assets/${videos[0].glossary}`}></iframe>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // )

    const Learn = () => (
      <div className="learn-more-background">
        <div className="learn-more-flex">
          <img src={`./assets/${contentData.popupContent[popupImage].image}`} alt={contentData.popupContent[popupImage].title} />
        </div>
        {/* <div className="container">
          <div className="learn-more-flex">
            <div className="learn-more-element">
              <div className="learn-more-title">
                <h1>Gene expression in patients<br /> with psoriasis</h1>
              </div>
              <div className="learn-more-content">
                <div className="learn-more-text">
                  <p>The two charts here confirm that the expression of both the IL-17A and IL-17F cytokines is increased significantly in lesional skin; in fact, looking at the scales on the vertical axes, we can see that the increase in IL-17F expression is greater than that of IL-17A. Therefore, inhibiting the activity of IL-17F in addition to IL-17A could lead to a greater reduction in inflammation and potentially higher clinical response rates in patients than inhibiting IL-17A alone.</p>
                </div>
                <div className="learn-more-image">
                  <img src={null} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    )

    const MenuButton = () => (
      <div className="menu-overlay overlay-layer">
        <button onClick={openMenu} className="menu-button">
          <div className="menu-button-content">
            <img src={MenuIcon} className="menu-icon" alt="Menu" />
            <span className="menu-text">Menu</span>
          </div>
        </button>
      </div>
    )

    const ReturnButton = () => (
      <div className="return-overlay overlay-layer">
        <button onClick={returnMain} className="return-button">
          <div className="return-button-content">
            <img src={ReturnIcon} className="return-icon" alt="Back" />
            <span className="return-text">Back</span>
          </div>
        </button>
      </div>
    )

    const LearnButton = () => (
      <div className="learn-overlay">
        <p className="learn-text">{contentData.popupContent[0].title}</p>
        <button onClick={() => toggleLearn(0)} className="learn-button">Learn More</button>
      </div>
    )

    const ThreeDControls = () => (
      <div className="three-d-controls-overlay">
        <button onClick={exteriorView} className={`three-d-button ${exteriorDisabled ? "three-d-disabled" : ""}`} disabled={exteriorDisabled}>
          <div className="three-d-button-content">
            <img src={ExteriorIcon} className="three-d-icon" alt="Exterior" />
            <span className="three-d-text">Exterior</span>
          </div>
        </button>
        <button onClick={interiorView} className={`three-d-button ${interiorDisabled ? "three-d-disabled" : ""}`} disabled={interiorDisabled}>
          <div className="three-d-button-content">
            <img src={InteriorIcon} className="three-d-icon" alt="Interior" />
            <span className="three-d-text">Interior</span>
          </div>
        </button>
      </div>
    )

    const RotateControls = () => (
      <div className="rotate-overlay">
        <button onClick={rotateSection} className={`rotate-button ${rotateDisabled ? "rotate-disabled" : ""}`} disabled={rotateDisabled}>
          <div className="rotate-button-content">
            <img src={RotateIcon} className="rotate-icon" alt="Rotate" />
            <span className="rotate-text">Rotate</span>
          </div>
        </button>
      </div>
    )

    const DisabledControlsOverlay = () => (
      <div className="disabled-controls-overlay"></div>
    )

    const PlaybackButtons = () => (
      <React.Fragment>
        <div className="back-overlay overlay-layer">
          <button onClick={prevChapter} type="button" className="back-button" data-toggle="tooltip" data-placement="right" title="Previous Chapter">
            <div className="back-button-content">
              <img src={LeftIcon} className="back-icon" alt="Back" />
              <span className="back-text">Back</span>
            </div>
          </button>
        </div>
        <div className="continue-overlay overlay-layer">
          <button onClick={nextChapter} type="button" className="continue-button" data-toggle="tooltip" data-placement="left" title="Next Chapter">
          <div className="continue-button-content">
              <span className="continue-text">Continue</span>
              <img src={RightIcon} className="continue-icon" alt="Continue" />
            </div>
          </button>
        </div>
      </React.Fragment>
    )

    const DeviceWarning = () => (
      <div className="warning-overlay">
        <div className="warning-content">
          <p className="warning-text">For the best possible experience, please rotate your mobile device.</p>
          <img src={RotateGif} alt="Rotate device" />
          <button onClick={hideWarning} className="warning-button">Dismiss</button>
        </div>
      </div>
    )
    
    return (
      <div className="video-group">
        <VideoPlayer { ...videoJsOptions } displayControls={threeDControlsVisible} />
        { startVisible? <StartScreen /> : null }
        { menuButtonVisible ? <MenuButton /> : null }
        { returnButtonVisible ? <ReturnButton /> : null }
        { playbackButtonsVisible ? <PlaybackButtons /> : null }
        { learnButtonVisible ? <LearnButton /> : null }
        { threeDControlsVisible ? <ThreeDControls /> : null }
        { threeDControlsVisible ? <RotateControls /> : null }
        { threeDControlsVisible ? <DisabledControlsOverlay /> : null }
        { menuVisible ? <Menu /> : null }
        {/* { glossaryVisible ? <Glossary /> : null } */}
        {/* { referencesVisible ? <References /> : null } */}
        { learnVisible ? <Learn /> : null }
        { warningVisible ? <DeviceWarning /> : null }
      </div>
    )
  }
  
  export default VideoElement;
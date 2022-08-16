import React, { useState, useLayoutEffect } from 'react';
import Watched from '../assets/images/watched.svg';
import InProgress from '../assets/images/in_progress.svg';
import NotWatched from '../assets/images/not_watched.svg';


const ChaptersList = (props) => {

    let video;
    let videoTime;

    const [myVidTime, setMyVidTime] = useState(null);
    
    useLayoutEffect(() => {
        
        // get video element
        video = document.querySelector('video');
        
        // capture latest video time
        video.addEventListener('timeupdate', function() {
            setMyVidTime(video.currentTime)
        }, false);
        
        // console.log("currentTime", video.currentTime)
        
    })
    
    const renderIcon = (data) => {

        videoTime = myVidTime;
        
        const chapterStartTime = props.breakdown(data.start);
        const chapterEndTime = props.breakdown(data.end);
        const chapterTitle = data.title;
        const chapterProgress = data.progress;

        // console.log("videoTime", videoTime)

        if ((chapterStartTime <= videoTime && chapterEndTime >= videoTime) && videoTime != null) {
            return (
                <>
                    <span className="menu-active">{chapterTitle}</span>
                    <img src={InProgress} alt="" />
                </>
            )
        }
        else if (chapterProgress === true) {
            return (
                <>
                    <span>{chapterTitle}</span>
                    <img src={Watched} alt="" />
                </>
            )
        }
        else if (chapterProgress === false) {
            return (
                <>
                    <span>{chapterTitle}</span>
                    <img src={NotWatched} alt="" />
                </>
            )
        }
    }

    return (
        <ul className="menu-sections">
            {props.progress.map((chapter, index) =>
                <li key={chapter.id}>
                    <button onClick={() => props.jump(chapter.start, index)}>
                        {renderIcon(chapter)}
                    </button>
                </li>
            )}
        </ul>
    );
}

export default ChaptersList;
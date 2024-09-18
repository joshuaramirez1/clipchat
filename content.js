let transcript = null;
let thinking = false;



let api_key = "";


//first attempt to fetch a stored api key
chrome.storage.sync.get('apiKey', function(data) {
    if (data.apiKey) {
        console.log(data.apiKey);
        api_key = data.apiKey;
    } else {
        console.log("NO API KEY");
    }
});

//function to get assistant response with a message
async function getResponse(message) {
    console.log(transcript);
     chrome.storage.sync.get('apiKey', function(data) {
        if (data.apiKey) {
            console.log(data.apiKey);
            api_key = data.apiKey;
        }
    });
    if (api_key === ''){
        const guideUrl = chrome.runtime.getURL('guide.html');
        return `<a href="${guideUrl}" target="_blank">Please provide your api key in the extension menu.</a>`;
    }
    let API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + api_key;
    console.log(api_key);
    console.log(API_URL);
    if (thinking) {
        return "Sorry, please slow down, I'm still completing about the previous request.";
    }
    thinking = true;
    let full_transcript = "";
    if (transcript == "1748error") {
        thinking = false;
        return "Sorry, there was an error retrieving this video's transcript. This is likely due to the video not having a transcript available. If it does have a transcript, please try refreshing the page and trying again.";
    }
    let tran = transcript
    for (let i = 0; i < tran.length; i++) {
        full_transcript += "Start: {" + Math.floor(tran[i].start/60) + "m " + Math.trunc((tran[i].start % 60)) + "s} Duration: {" + tran[i].dur + "s} text: { " + tran[i].text + "}. "; 
    }
    let formatted_prompt = "You are a youtube assistant to assist with answering questions about a specific youtube video. In your case this is the video. Here is the video transcript:" + full_transcript +". You should now respond to the users query to the best of your ability. Query: " + message + ". Please keep your response consice. consice in a conversational manner/max 3 sentences, should be shorter though, complete sentences are not always neccesary. Cite your sources in your response with start timestamps. When outputting a timestampt to make it linkable output with [mm:ss]. Please output in markdown, except for the time stamps, ensure the have the following format [mm:ss]. Examples of time formatting [00:23] or [03:43]. Your (formatted) Response: ";
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: formatted_prompt }]
                    }
                ]
            })
        });
        if (!response.ok) {
            if (response.status == 429) {
                thinking = false;
                return "Sorry, the server recieved too many requests. Please try again in a few minutes.";
            }
            thinking = false;
            return "Sorry, please try asking that in a different way.";
        }

        const data = await response.json();
        thinking = false;
        //this probably was not neccessary.
        if (data) {
            finish_reason = data.candidates[0].finishReason;
            if (finish_reason == "SAFETY") {
                return "Sorry, the request was deemed unsafe.";
            } else if (finish_reason == "STOP"){
                return data.candidates[0].content.parts[0].text;
            } else if (finish_reason == "RECITATION") {
                return "Sorry, the request potentially contained copyright violations.";
            } else if (finish_reason == "OTHER") {
                return "Sorry, the request was blocked due to other reasons.";
            } else if (finish_reason == "BLOCKLIST") {
                return "Sorry, the request was blocked due to content restrictions.";
            } else if (finish_reason == "PROHIBITED_CONTENT") {
                return "Sorry, the request contained prohibited content.";
            } else if (finish_reason == "SPII") {
                return "Sorry, the request violated personally identifiable information (PII) guidelines.";
            } else if (finish_reason == "MALFORMED_FUNCTION_CALL") {
                return "Sorry, there was an error in the function call.";
            }
            return "hmm";
        } else {
            console.error("Bad response structure from gemini");
            return "Sorry, pleasy try asking that in a different way.";
        }
    } catch (error) {
        console.error("Error fetching response from gemini:", error);
        return "Sorry, please try asking that in a different way.";
    }
}

const profile_images = [
    "https://yt3.ggpht.com/4qSMXHR-lYpKDYwReTuV3vEET6OSgAlkVQk2tl3vP4oAenLphySn-iWM0VTgWowvka2gasm17w=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_k35QdrE7QcKsopeEng6SQO7J611S7LZUTaY0OzG5j8sv67=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/THx_EhKQAGwRqqJ9294S823LO_0nbp3cAyy_CWDXE3Hs5x7WTYyr_OWrZ7T4QriWdw3WbZwbvg=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_liOvHtY9m7Jg2OYNSkQpFT6uXaN-_1-3VTuZ4Psql62gu_MfkkEiW7iUW9nHwIeCEOCw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/qA11MEqlhf894-lgTnB4eb3b34V-Hsh8YBg0yhS-oAUfCKR1Z4FiXqdvDDugXRaUm1yWFRhSq0k=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_nUtUWnt2ktZwzLPqRbH_gQKirmP_RcxAW0kUxXvnp5Bg=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mLKPfQfsYtfUyqqe6FpMayQRafZoRgOUnqIFjEi-enSreCJmiWcdakwZy3g21qd24UHw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/3YNZ0QbbN7taM5SZuwTPSrRXIYvBuWpeucFoOXHD71E6Tyb6Pv0nOMkRQmK7pvCsiG_gMbMyCTU=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_m5evfCF_YxC_lDCZai6PdDPi8RLB_PVhrL3a1ARTLFBM2x9-KClsWFWW2FfUzwIrVBkQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mWIpaYPl9giUQMlwgKeN5iuXDPta0CStI5jtBhTFc=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_kbsODQOetekqFgLyiaoIi4EciW_1ku1Z6W-SxXKjs4mA=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mWffeFkwGmQVFW_jFaNRUSR057UAeidiW0_oL_Xt77SA=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mMx_tFlGWDR-Wl9ayeBH_r-1rU_U1SLD2R66s8zdo=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/RKtvLQ2SnFJbfAVqy9b2kSaMJLOWjaYe2d2DjKADnEtQtdsIS_DE2vRGcEWiiJSzdx6B1zB9Gg=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_nt-wFErbDSgZloDh4zTfGIH006Ls2veQpMzZKHxB4=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_nG_QiEWDO0V3EZOXQXUU7UAWOoMglhTF_VJoBdvU8=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_naVtQgGqLR2mEJBYsUptJWeahbG_5vnBCPaDOqBcwUdRBL6bJjSCLq-kGRbS6uIBwmZQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_kHW1jtPKPK3CPP9MqhvvDNmSRpED8KIA6bdaYUzr4A5w=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/L6sUg7kIkJAX-IMhee6ymX0Tc75bNCWhwNwXyIlLK5V4jypUM1uGFafHQmwDUVXaffvanlfgSWM=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/3GOxicTmXLVM20lN15T0aRGyVLGAzl7NJHQj24cFpbK25McaXogTZ15fnht6i1A7NV3IRTwE6rU=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_lduTNfeNzTHqV8SKldJQF1JzwgQ1Sx5o3Sy3jBDmwvh-M=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/rjw5up7tEZJ39FBYtoBWr-vjII223rsc0cF1rXPjDHSwwyHYEHBWsfFFoZ3NbZG-9W1HITVn=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/4_o3QQJyySIPMBM_0DX2wik298hIaZE4yacT-2Ukcg8PF_0kaBlriRrFINeBhRw-6CcY2cht=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/H00B5udmYu2LVWnnDxZhBO_1dhvuXv4k4QJFgYZPfvWySILD1q25Df48IOVvMnlCZ2depxRK=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/FxSBrPHb9xevyuN2DZ6vHS7s1vWpX_S-BpeZk1rJPXHk5VM0SS6ZfXvlHzJukDMNxYkZwG7h_w=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/MfvCsF9HXv8rxO83R2J-hJIYRJdFQYIOaE0nMielHFpp7uhJYCUMPAsn6mRGMzAsTl8fXQOZCw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mU7L2wEfEzcHuFEoSqF1RYpl6m-KN5cRiUiGJvQfrt-7U=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/YeLZrE-8d738er_k8J9QetouFy1I4eQaTdwwy2qGJ_1sN7PqBORaaOOW-hRxf5i_Zql5TuDK-Q=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/L8CQUm4UBHwA4do8Lu303BJIo12fbImsfzRWWWv8GQxPusDKE676O-hq62yNH5TuJHhwLJ44=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/gyS2ONv9LbLyo8lw6VM7NlfTyRYeuh9pcifn86tnflj4ZGJ1_LebFPzG01L2_6nd_8RDkOw0=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/m36ZH748KzXmdJh85g-GbIZs05LldJEra2s1QLV0r6bremYrDt6I8pXBFtfVSnLNyM33qjgG_Q=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/jVMOxer-gOEKGVDMNZS5WtR3NTqHfV3DUP6l-IIzsyYwDSbWxCQvpj8UJseu3xyKXeiqlciS3w=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/8BnElk6YM3ZITZ6RCHotLNgsmnxzIyWieFiz5W-wHcQjkduj7ygkzGp8nPYOXylgb7HHHNp1=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/a015D_hGMCwwgPozrLiUa0KnACA0ShV8H8S7BTI3HdzbGowesOuEC-_qFqosrlp7tBHwQcPzbQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/x6082Qju2_tKxweE8RxA8DkZI0V60fgq8UsL5wVttXcKQ3q6JStcHLJq_qKiu8zsUhqDr2ASdQI=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/no60v2bf0EqVmMtXgxmYdLhoQ5cQU8T8HgPG-1bYdyF7utIEVXYv92Uqi7Qc7NPkd56e0tlG=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_lnRC-0ps3Jb_Otip-IBo6ZK8FHDtbYGzbJwFq4WzQOVS4=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/2EQLPOkDeDjNXavG0Fku0ow2ikSD-t7Pxfcye4KkDrTK5rVj2Y4Jk0IoBFTzk4z2YIfY7xCW=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_njv5bj96nXZPdVSGWFsAya7ecRhM4u_78FX5cOyq1Aefxs0LYhy-CVDYRCpSNnYeaQwA=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/RSADK0eIfsYFMjce9plNm7len67-cAnytLrhRgeqi7iEo_DiwwVi3jc3W5utzCX8-7Jd_N1ZeQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_m11o7_BZUassmxaPQwMP1jiVjAZ3BcxtdePA3LfOf72WE=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/LqC39li-CgHzNt-LBUYfPgP2AJQPK4TPY7lD8ugCBjnMxrsgiO7lKznLBeE8b9Y-g7xvtM-M7A=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_nesbUu2morqXCfkBa3c_RO-jmnMKKr9S3fjhauRSmFxXo=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/h3PHHSh-WpbK6tz-Tf0GpoW7AAamqkoudf8iAQQNtRGWT8GYWZzqV-m4LrW8gvGg_3d3EzxuZQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_kb3lvBxk066LWFry0nI_HX_5FP4pADrVl_D0tVXhygaWjU=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/V6D_lzlnAc580fpZOp2qL4vcfbVEuUlrkRVx9rQzHFdib0wQiLKWxZQK0t9HZRCs5RafUlTBhdg=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_n_ZrWExbDRSIz8Voh41AujaEttpjrfTGbJk_APRLFPN7E=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/zR6-efMeOwNuZr47KU0xXHS0E-Hxj78h8WAtV3FaW5J8ySvvMnRGCL6o0BqEouDScV0i2B6O_g=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_kp7eR8zmuoPIVKfdo0WJHggQ6g5QMgioSgtDU44pfEzw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_kAdHyg5FqhxCnLaqr_ABFag885ynA-WFqKb4YVerelcmw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/7bALDQO_5PEcTKgbqZn-fASbbwHt2n--mKOYTQi0f2bdiUy26DSzuhriEF5syK2xwcHUUZRcn6g=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_nHB8U9e4zSPQ74PIzNU0NzQkORqsHVUZCyLuJ1MRsjVQ=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_n8xvaoBW0QnZAlfEynEld0ZHKxdJai60cB47_1c1ZgncU=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_mD7ANQUkGkaa1SJmCHKxUuW_rfSmhvYvKwdk16M-aob3k=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_ldMhLo--Foe46eRM-QJ-bg2K5eqzQZdgKTS424aoef1Hg=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_lzfk4fhMeioECZnZyv-rlJw_R0ebNxSR7ee2uPW0eJNro=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/ytc/AIdro_k1P1jQCQ_q94cqklYpsruOeNEPPV8-f_RH4BjxEZtsyw=s88-c-k-c0x00ffffff-no-rj",
    "https://yt3.ggpht.com/x90vGV8ryfn-o2EFYnZcrvgUIw4jVys7zIsImemy9_ZNd0BXG2fF7jExFDCnjjfLLyRP3VGdPS0=s88-c-k-c0x00ffffff-no-rj" 
];


function getRandomProfileImage() {
    return profile_images[Math.floor(Math.random() * profile_images.length)];
}


function getVideoId(url) {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
}


function checkForVideoAndFetchTranscript() {
    const videoId = getVideoId(window.location.href);
    if (videoId) {
        chrome.runtime.sendMessage({
            action: "fetchTranscript",
            videoUrl: window.location.href
        });
    }
}


let comment_count = 1300 + Math.floor(Math.random() * 10000);



function createCommentsSection() {
    const already_exits = document.getElementById('transcript-comments-section');
    if (already_exits){ 
        return;}
    const expandable_metadata_div = document.getElementById('expandable-metadata');
    if (!expandable_metadata_div) return;
 
    const comments_section = document.createElement('div');
    comments_section.id = 'transcript-comments-section';
    comments_section.innerHTML = `
      <h2 id="comments-title">${comment_count} Comments</h2>
      <div id="comment-input-container">
        <img class="comment-avatar" src="${getRandomProfileImage()}" alt="Your Avatar">
        <textarea id="comment-input" placeholder="Add a comment..."></textarea>
      </div>
      <div id="example-buttons-container">
        <button class="example-button">What's this video about?</button>
        <button class="example-button">Give me a table of contents for this video.</button>
        <button class="example-button">What are the key points in this video?</button>
      </div>
      <div id="comments-list"></div>
    `;
    expandable_metadata_div.parentNode.insertBefore(comments_section, expandable_metadata_div.nextSibling);
  
    const style = document.createElement('style');
    style.textContent = `
       #transcript-comments-section {
        margin: 20px auto;
        padding: 20px;
        border-radius: 16px;
        background-color: var(--yt-spec-base-background);
        color: var(--yt-spec-text-primary);
        font-family: "Roboto", "Arial", sans-serif;
        }

        #comments-title {
        margin-bottom: 20px;
        font-size: 20px;
        font-weight: bold;
        }

        #comment-input-container {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
        }

        #comment-input {
        flex-grow: 1;
        padding: 4px;
        margin-left: 16px;
        border: none;
        border-bottom: 2px solid var(--yt-spec-10-percent-layer);
        background-color: var(--yt-spec-base-background);
        color: var(--yt-spec-text-primary);
        font-size: 12px;
        }

        #comment-input:focus {
        outline: none;
        border-color: var(--yt-spec-call-to-action);
        }
        

        #example-buttons-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        }

        .example-button {
        background-color: #f0f0f0;
        border: none;
        border-radius: 16px;
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        transition: background-color 0.3s;
        }

        .example-button:hover {
        background-color: #e0e0e0;
        }


        #comments-list {
        max-height: 1000px;
        overflow-y: auto;
        }

        .comment {
        display: flex;
        align-items: flex-start;
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--yt-spec-10-percent-layer);
        }

        .comment-avatar {
        width: 40px;
        height: 40px;
        margin-right: 16px;
        border-radius: 50%;
        object-fit: cover;
        }

        .comment-content {
        flex-grow: 1;
        }

        .comment-author {
        margin-bottom: 8px;
        font-weight: bold;
        font-size: 16px;
        }

        .comment-text {
        margin-bottom: 4px;
        font-size: 15px;
        line-height: 1.5;
        }

        .comment-reply-count {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--yt-spec-call-to-action);
        cursor: pointer;
        }

        .sub-comment {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--yt-spec-10-percent-layer);
        }

        .sub-comment .comment-avatar {
        width: 32px;
        height: 32px;
        }

        .comment-interactions svg {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        cursor: pointer;
    }
    .comment-interactions svg:hover {
        fill: var(--yt-spec-text-primary);
    }


  .sub-comment-reply {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--yt-spec-call-to-action);
    cursor: pointer;
  }

  .sub-comment-input {
    margin-top: 8px;
  }

  .sub-comment-textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--yt-spec-10-percent-layer);
    border-radius: 4px;
    background-color: var(--yt-spec-base-background);
    color: var(--yt-spec-text-primary);
    font-size: 14px;
    resize: vertical;
  }

  .sub-comment-send {
    margin-top: 8px;
    padding: 6px 12px;
    background-color: var(--yt-spec-call-to-action);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }

  .sub-comment-send:hover {
    background-color: var(--yt-spec-call-to-action-inverse);
  }

        `;
    document.head.appendChild(style);
    document.getElementById('comment-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postComment();
      }
    });

    document.querySelectorAll('.example-button').forEach(button => {
      button.addEventListener('click', () => {
        document.getElementById('comment-input').value = button.textContent;
        postComment();
      });
    });
  
    const users = ['@kennyboggs3676', '@smiley3637', '@johnny123', '@sarah_sunshine', '@danny_dynamite', '@lizzy_lover', '@rick_rolling', '@techgeek45', '@hannahbanana', '@gamer_guy', '@luna_lovegood', '@the_real_deal', '@fit_freak', '@queen_of_memes', '@witty_wizard', '@cool_cat', '@music_fanatic', '@happy_hippo', '@meme_master', '@sunny_days', '@movie_buff', '@crazy4cats', '@adventure_awaits', '@chill_pill', '@sneaky_ninja', '@bubbly_blossom', '@smart_cookie', '@laughing_lion', '@zen_master', '@panda_pals', '@fun_guru'];

    const comments = [
    'This video had more tension and drama than a South Korean TV drama show.',
    'got me cracking up',
    'I can\'t stop laughing, this is hilarious!',
    'Just what I needed today, thanks!',
    'This made my day. Pure gold!',
    'I\'m in tears, this is too funny!',
    'Comedy gold, keep it up!',
    'I didn\'t expect that twist, wow!',
    'This just made my morning.',
    'timing was epic, perfect!',
    'Can\'t believe this actually happen!',
    'Hands down best thing I seen all week.',
    'Laughed so hard I spill my coffee!',
    'Imma share this with everyone I know!',
    'Legendary content, well done!',
    'This was so unexpected, loved it!',
    'Editing here so good!',
    'This cracked me up, more like this pls!',
    'Instant classic, well done!',
    'This vid is pure joy, thank you!',
    'Better plot twist than most movies!',
    'My sides hurt from laughing so much.',
    'You got a new fan, keep it up!',
    'Totally didn\'t see that coming, lol!',
    'You\'re a comedy genius!',
    'This gonna go viral for sure.',
    'Creativity here is top-notch.',
    'This just made my entire week!',
    'Simple yet so funny!',
    'I can\'t believe I almost missed this!',
    'I needed that laugh, thanks.'
    ];

    for (let i = 0; i < 60; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    addCommentToList(user, comment);
    }
}



function postComment() {
    const input = document.getElementById('comment-input');
    const message = input.value.trim();
    if (message) {
      addCommentToList('User', message);
      getResponse(message).then(response => {
        addSubCommentToList('Assistant', response, comment_count - 1);
      });
      input.value = '';

      const commentsList = document.getElementById('comments-list');
      commentsList.scrollTop = 0;
    }
}

function addCommentToList(author, message) {
    const commentsList = document.getElementById('comments-list');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.index = comment_count;
    commentElement.innerHTML = `
      <img class="comment-avatar" src="${getRandomProfileImage()}" alt="${author}'s Avatar">
      <div class="comment-content">
        <div class="comment-author">${author}</div>
        <div class="comment-text">${message}</div>
        
        <div class="comment-interactions">
            <span class="thumbs-up-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="thumbs-down-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V11C22 11.5304 21.7893 12.0391 21.4142 12.4142C21.0391 12.7893 20.5304 13 20 13H17M10 15V19C10 19.7956 10.3161 20.5587 10.8787 21.1213C11.4413 21.6839 12.2044 22 13 22L17 13V2H5.72C5.23965 1.99448 4.77187 2.16359 4.40436 2.47599C4.03684 2.78839 3.79558 3.22309 3.72 3.7L2.34 12.7C2.29647 12.9866 2.31583 13.2793 2.39666 13.5577C2.47749 13.8362 2.61788 14.0937 2.80814 14.3125C2.99839 14.5313 3.23386 14.7061 3.49843 14.8248C3.763 14.9435 4.05014 15.0033 4.34 15H10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
        </div>
        <div class="comment-reply-count" style="display: none;">View 0 replies</div>
        <div class="sub-comments" style="display: none;"></div>
      </div>
    `;
    commentsList.insertBefore(commentElement, commentsList.firstChild);
  
    updateCommentCount(1);
}


function addSubCommentToList(author, message, parentIndex) {
    const parentComment = document.querySelector(`.comment[data-index="${parentIndex}"]`);
    if (parentComment) {
        const subCommentsContainer = parentComment.querySelector('.sub-comments');
        const subCommentElement = document.createElement('div');
        subCommentElement.className = 'comment sub-comment';

        
        //used ai for this parsing
        message = message.replace(/\[(\d+):(\d+)\]/g, (match, minutes, seconds) => {
            const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
            const url = `https://www.youtube.com/watch?v=${getVideoId(window.location.href)}&t=${totalSeconds}`;
            return `<a href="${url}">${match}</a>`;
        });

        message = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              
            .replace(/\n/g, '<br>')                          

        subCommentElement.innerHTML = `
            <img class="comment-avatar" src="${getRandomProfileImage()}" alt="${author}'s Avatar">
            <div class="comment-content">
                <div class="comment-author">${author}</div>
                <div class="comment-text">${message}</div>
                <div class="sub-comment-reply">Reply</div>
                <div class="sub-comment-input" style="display: none;">
                    <textarea class="sub-comment-textarea" placeholder="Add a reply..."></textarea>
                    <button class="sub-comment-send">Send</button>
                </div>
            </div>
        `;
        subCommentsContainer.appendChild(subCommentElement);

        const replyCountElement = parentComment.querySelector('.comment-reply-count');
        const currentReplyCount = subCommentsContainer.children.length;
        replyCountElement.textContent = `View ${currentReplyCount} ${currentReplyCount > 1 ? 'replies' : 'reply'}`;
        replyCountElement.style.display = 'block';

        if (!replyCountElement.hasListenerAttached) {
            replyCountElement.addEventListener('click', () => {
                const isHidden = subCommentsContainer.style.display === 'none';
                subCommentsContainer.style.display = isHidden ? 'block' : 'none';
                replyCountElement.textContent = isHidden ? `Hide ${currentReplyCount} ${currentReplyCount > 1 ? 'replies' : 'reply'}` : `View ${currentReplyCount} ${currentReplyCount > 1 ? 'replies' : 'reply'}`;
            });
            replyCountElement.hasListenerAttached = true;
        }

        const replyButton = subCommentElement.querySelector('.sub-comment-reply');
        const replyInput = subCommentElement.querySelector('.sub-comment-input');
        const replyTextarea = subCommentElement.querySelector('.sub-comment-textarea');
        const sendButton = subCommentElement.querySelector('.sub-comment-send');

        replyButton.addEventListener('click', () => {
            replyInput.style.display = 'block';
            replyTextarea.focus();
        });

        sendButton.addEventListener('click', () => {
            const replyMessage = replyTextarea.value.trim();
            if (replyMessage) {
                sendSubCommentReply(replyMessage, parentIndex);
                replyTextarea.value = '';
                replyInput.style.display = 'none';
            }
        });

        replyTextarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });
    }
}


//adds a sub comment to the parent.
 function sendSubCommentReply(message, parentIndex) {
  const parentComment = document.querySelector(`.comment[data-index="${parentIndex}"]`);
  const subCommentsContainer = parentComment.querySelector('.sub-comments');
  const originalCommentText = parentComment.querySelector('.comment-text').textContent;
  const originalCommentAuthor = parentComment.querySelector('.comment-author').textContent;
  const chatHistory = getChatHistory(subCommentsContainer, originalCommentAuthor, originalCommentText);

  getResponse(chatHistory + "\nCurrent User Query: " + message).then(response => {
    addSubCommentToList('Assistant', response, parentIndex);
  });

  addSubCommentToList('User', message, parentIndex);
}
//gets chat history for comment replies.
function getChatHistory(subCommentsContainer, originalCommentAuthor, originalCommentText) {
  let history = `${originalCommentAuthor}: ${originalCommentText}\n`;
  const comments = subCommentsContainer.querySelectorAll('.sub-comment');
  comments.forEach(comment => {
    const author = comment.querySelector('.comment-author').textContent;
    const text = comment.querySelector('.comment-text').textContent;
    history += `${author}: ${text}\n`;
  });
  return history;
}

function updateCommentCount(increment) {
  comment_count += increment;
  const titleElement = document.getElementById('comments-title');
  titleElement.textContent = `${comment_count} Comments`;
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "transcriptFetched") {
    transcript = request.data;
    createCommentsSection();
  } else if (request.action === "transcriptError") {
    console.error("Error fetching transcript:", request.error);
  } 
});

checkForVideoAndFetchTranscript();

let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkForVideoAndFetchTranscript();
  }
}).observe(document, {subtree: true, childList: true});



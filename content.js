// Wait for the DOM content to be fully loaded
if (window.location.hash.includes('ajaxUILoc')){
    console.log('Hello');
    sleep(2000).then(() => { startProgram(); });
}
else {
    startProgram();
}

function startProgram(){
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded',afterDOMLoaded);
    } else {
        afterDOMLoaded();
    }
}

function afterDOMLoaded(){

    const rtPolje = document.getElementById("whole_subpanel_cnt_rt_tasks_cases");

    if (isEmpty(rtPolje)) {
        console.log("rtPolje se nije kreiralo ni nakon DOMContentLoaded");
      } else {
        console.log("Rt polje postoji nakon DOMContentLoaded");
      }

    //const rtBroj = document.querySelector("#list_subpanel_cnt_rt_tasks_cases > table > tbody")
    const rtBroj = document.querySelector("#list_subpanel_cnt_rt_tasks_cases > table > tbody > tr.evenListRowS1 > td:nth-child(3)")

    if (isEmpty(rtBroj)) {
        console.log("rtBroj se nije kreiralo ni nakon DOMContentLoaded");
      } else {
        console.log("rtBroj postoji nakon DOMContentLoaded", rtBroj);
      }

      createIconsUnderTabContent(getCreatedTickets());
        
    //Everything that needs to happen after the DOM has initially loaded.
}

function isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function getCreatedTickets() {
    const rtIdFieldMatches = document
    .querySelectorAll("#list_subpanel_cnt_rt_tasks_cases > table > tbody > tr.evenListRowS1 > td:nth-child(3), #list_subpanel_cnt_rt_tasks_cases > table > tbody > tr.oddListRowS1 > td:nth-child(3)")

    validRtIds = [...rtIdFieldMatches]
    .map((element) => element.textContent.trim())
    .filter((element) => element !== "");

    uniqRtIds = [...new Set(validRtIds)];
    
    console.log("Pronadeni tiketi: ", uniqRtIds);

    return uniqRtIds;
}

function createIconsUnderTabContent(fields) {
    const tabContentDiv = document.getElementById('tab-content-0');
    if (!tabContentDiv) return; // Exit if the tab content div doesn't exist

    // Create the outer div similar to the one you provided
    let detailViewRow = document.createElement('div');
    detailViewRow.classList.add('row', 'detail-view-row');

    // Create the first column for the label
    let labelCol = document.createElement('div');
    labelCol.classList.add('col-xs-12', 'col-sm-2', 'label', 'col-1-label');
    labelCol.textContent = 'Tiketi:'; // Set the label text

    // Create the second column for the icons without the inlineEdit class
    let iconsCol = document.createElement('div');
    iconsCol.classList.add('col-xs-12', 'col-sm-10', 'detail-view-field'); // Removed 'inlineEdit'
    iconsCol.id = 'RT-text-field';

    // Create icons directly inside the icons column without a container
    for (let field of fields) {
        if (field) {
            const googleSearchUrl = `https://tt.carnet.hr/rt/Ticket/Display.html?id=${encodeURIComponent(field)}`;

            //Create container for text and hashtag icon
            let rTWrapper = document.createElement('div');
            rTWrapper.classList.add('rTHash');

            let rTWrapperText = document.createElement('span');
            rTWrapperText.textContent = '#';

            // Append RT number to the wrapper
            rTWrapper.appendChild(rTWrapperText);

            //Add click event to copy RT num
            rTWrapper.querySelector('span').addEventListener('click', (event) => {
                navigator.clipboard.writeText(field);
            })
            
            // Create a container for text
            let iconWrapper = document.createElement('div');
            iconWrapper.classList.add('icon-wrapper'); // For alignment
            iconWrapper.style.cursor = 'pointer'; // Make it clickable

            // Add click event to open the link
            iconWrapper.addEventListener('click', (event) => {
                if (event.button === 0){
                    window.open(googleSearchUrl, '_blank');
                }
            });

            // Right-click event to copy the link to clipboard
            iconWrapper.addEventListener('contextmenu', (event) => {
                event.preventDefault(); // Prevent the default right-click menu
                navigator.clipboard.writeText(googleSearchUrl).then(() => {
                    // Send a message to the background script to show the notification
                    chrome.runtime.sendMessage({
                        type: 'notification',
                        message: `Ticket link copied: ${googleSearchUrl}`
                    });
                }).catch((error) => {
                    console.log('Failed to copy link', error);
                });
            });


            // Create a span for the RT number
            let rtNumber = document.createElement('span');
            rtNumber.textContent = `${field}`;

            // Append RT number to the wrapper
            iconWrapper.appendChild(rtNumber);

            // Append the icon wrapper directly to the icons column
            iconsCol.appendChild(rTWrapper);
            iconsCol.appendChild(iconWrapper);
        }
    }

    // Append both columns to the detail view row
    detailViewRow.appendChild(labelCol);
    detailViewRow.appendChild(iconsCol);

    // Append the detail view row to the tab content div
    tabContentDiv.appendChild(detailViewRow);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


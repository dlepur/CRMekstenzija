// Wait for the DOM content to be fully loaded
if (window.location.hash.includes('ajaxUILoc')){
    // console.log('Opening Ajax version link.');
    // sleep(2000).then(() => { startProgram(); });
    let elementFound = false;
    const observer = new MutationObserver((mutationList, observer) => {
        for (let mutation of mutationList) {
            if (mutation.type === 'childList') {
                const targetElement = document.querySelector('#list_subpanel_cnt_rt_tasks_cases');
                if (targetElement && !elementFound) {
                    console.log('Element loaded via AJAX!');
                    elementFound = true;
                    observer.disconnect();
                    startProgram();
                }
            }
        }
    })

    observer.observe(document.body, { childList: true, subtree: true });
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

      const createdTickets = getCreatedTickets();
      const externalTickets = getExternalTickets();

      if(externalTickets || createdTickets)
        document.querySelector('[data-field=komentar_c]').setAttribute('style', 'margin-bottom=1px;');

      if(externalTickets)
        createIconsUnderTabContent(externalTickets, "Vanjski Tiketi:");

      if(createdTickets)
        createIconsUnderTabContent(createdTickets, "Tiketi:");
        
    //Everything that needs to happen after the DOM has initially loaded.
}

function isEmpty(val) {
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

// dohvacanje tiketa koji su kreirani u istom zahtjevu
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

//dohvacanje tiketa koji su dodani u komentar zahtjeva, a nisu kreirani u istom zahtjevu
function getExternalTickets() {
    const pattern = /(?:rt|tic?ket)[:#-]? ?(\d{6})/gmi;
    let counter = 0;
    var komentarTickets = new Set();
    let text = document.getElementById("komentar_c").textContent;

    if (text.length){
        while (null != (z=pattern.exec(text))) {
            console.log(z);
            console.log(z[1]);
            komentarTickets.add(z[1]);
            counter++;
        }
        console.log("Counter tiketa iz komentara: ", counter);
    
        const createdTickets = getCreatedTickets();
    
        // diffTickets = new Set(createdTickets);
        // for (const element of komentarTickets) {
        //     diffTickets.delete(element);
        // }
    
        diffTickets = getValueDifferential(createdTickets, [...komentarTickets]);
    
        return diffTickets;
    }

    return null;
}

function createIconsUnderTabContent(fields, fieldLabel) {
    // check if any tickets exist
    if(fields.length){
    console.log(fieldLabel, "broj: ", fields)
    const tabContentDiv = document.getElementById('tab-content-0'); // dohvaca cijeli div od "Naziv zahtjeva:" do "Komentar:". Problem je sto se zahtjev nekad generira tako da polja "Riješenje problema:" i "Komentar:" budu izvan ove klase, pa sam odustao od ovog nacina
    const tabContentDiv2 = document.querySelector('[data-field=komentar_c]'); // dohvaca samo "komentar polje"
    if (!tabContentDiv2) return; // Exit if the tab content div doesn't exist

    // div-ovi isti kao s polja: Komentar, Rješenje problema, Opis problema...
	let detailViewRow = document.createElement('div');
	detailViewRow.classList.add('row', 'detail-view-row');

	let detailViewRowItem = document.createElement('div');
	detailViewRowItem.classList.add('col-xs-12', 'col-sm-12', 'detail-view-row-item');
    detailViewRowItem.setAttribute('style', 'margin-top: 1px;');

	let colOneLabel = document.createElement('div');
	colOneLabel.classList.add('col-xs-12', 'col-sm-2', 'label', 'col-1-label');
    colOneLabel.textContent = fieldLabel;
    colOneLabel.setAttribute('style', 'padding-top: 14.007px;');

	let iconsCol = document.createElement('div');
	iconsCol.classList.add('col-xs-12', 'col-sm-10', 'detail-view-field');
	iconsCol.id = 'RT-text-field';

    //dodavanje tiket gumba za svaki pronadeni tiket
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
	//detailViewRow.appendChild(detailViewRowItem);
    detailViewRowItem.appendChild(colOneLabel);
    detailViewRowItem.appendChild(iconsCol);

    // Append the detail view row to the tab content div
    //tabContentDiv.appendChild(detailViewRow);
    tabContentDiv2.insertAdjacentElement("afterend", detailViewRowItem);
    }  
}

// vraca tikete zapisane u komentaru koji nisu kreirani bas u zahtjevu
function getValueDifferential(smallerArray, biggerArray){

    let exists = 0;
    const foundExternalTickets = new Set();

    for (vanjski of biggerArray){
        for (kreirani of smallerArray){
            if (vanjski === kreirani)
                exists=1;
        }
        if(!exists)
            foundExternalTickets.add(vanjski);
        exists = 0;
    }

    console.log("Tiketi iz komentara koji su vanjski", [...foundExternalTickets]);

    return [...foundExternalTickets];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


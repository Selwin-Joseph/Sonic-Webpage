
const host = "http://192.168.1.50:5000";
const getapi = host + "/get_data";
console.log(getapi)

document.addEventListener('DOMContentLoaded', function () {
    const state = {
        tables: {},
        data: [],
        activeComponent: null,
        searchTerm: '',
    };

    //import to excel button
    let importButton = document.getElementById("excel"); // add button function
    importButton.addEventListener("click", () => {convertJSONtoCSV()});

     //Generate excel button
     const generateButton = document.getElementById("generate-excel");
     generateButton.addEventListener("click", () => {generateExcel();} , {once: false});
       

    ///////// search button function
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', function () {
        const searchTerm = searchBox.value.trim().toLowerCase();
    // Iterate through all tables and filter rows based on the search term
    document.querySelectorAll('table').forEach(table => {
        const tbody = table.querySelector('tbody');
        const thead = table.querySelector('thead');
        let hasMatchingRow = false;
        // Iterate through all rows in the tbody
        tbody.querySelectorAll('tr').forEach(row => {
            const paramName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            // Show/hide rows based on the search term
            if (paramName.includes(searchTerm)) {
                row.style.display = ''; // Show the row
                hasMatchingRow = true;
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide the entire table based on matching rows
        if (hasMatchingRow) {
            table.style.display = ''; // Show the table
            if (thead) thead.style.display = ''; // Show the table heading
        } else {
            table.style.display = 'none';
            if (thead) thead.style.display = 'none';
        }
    });


    document.addEventListener('activeComponentUpdated', function (event) {
        // Check if the event was triggered by the displayDetails function
        if (event.detail && event.detail.component) {
            // Do not call displayDetails again here to avoid an infinite loop
            // Instead, you can perform additional actions if needed
            console.log('Active component updated:', event.detail.component);
        }
    });
   
});

    //////////////////////// FUNCTION TO FETCH DATA FOR GENERATING EXCEL //////////////////////////////////////////////////////////////////////
    function generateExcel() {
        // Get the selected "From" and "To" dates inside the function
        const fromDate = document.getElementById("from-date").value;
        console.log(fromDate)
        const toDate = document.getElementById("to-date").value;
        const rms = document.getElementById("rms").value;


         // check if RMS is selected
         if (rms === '') {
            alert('Please select Site ID');
            return;
        }

                // Check if "From" and "To" dates are empty
        if (fromDate === '' || toDate === '') {
            alert('Please select both "From" and "To" dates.');
            return;
        }

        // Convert date strings to Date objects for easier comparison
        const fromDateTime = new Date(fromDate);
        const toDateTime = new Date(toDate);

        // Check if "From" date is greater than "To" date
        if (fromDateTime > toDateTime) {
            alert('Selected "From" date is higher than the selected "To" date.');
            return;
        }
    
        fetch(getapi + "?fromDate=" + fromDate + "&toDate=" + toDate + "&rms_id=" + rms)
          .then(function (response) {
            //console.log(response)
            if (response.ok) {
              return response.json();
            }
            throw new Error('Error: ' + response.status);
          })
          .then(function (data) {
            if (data.data.length === 0) {
                alert("No records found.");
            } else {
                console.log(data);
                downloadExcel(data);
                
            }
          })
          .catch(function (error) {
            console.log(error);
            
          });
      }



function downloadExcel(data) {
  // Extract names and values from the input data
  const names = data.data[0].name.split(",");
  const values = data.data.map(entry => entry.value.split(","));

  // Create the CSV header
  let csvContent = "s.no,name";

  // Add value columns to the header
  for (let i = 1; i <= values.length; i++) {
      csvContent += `,value${i}`;
  }

  csvContent += "\n";

  // Populate the CSV content
  for (let i = 0; i < names.length; i++) {
      csvContent += `${i + 1},${names[i]}`;

      for (let j = 0; j < values.length; j++) {
          csvContent += `,${values[j][i]}`;
      }

      csvContent += "\n";
  }

  // Download the CSV file
const blob = new Blob([csvContent], { type: "text/csv" });
const link = document.createElement("a");

// Get local date and time in the desired format
const currentDate = new Date().toLocaleDateString().replace(/\//g, '-'); // Replace slashes with hyphens
const currentTime = new Date().toLocaleTimeString().replace(/:/g, '-'); // Replace colons with hyphens

// Set the download name with the formatted date and time
link.download = "Log Data " + currentDate + " " + currentTime + ".csv";

// Create a link to the Blob
link.href = URL.createObjectURL(blob);

// Trigger the click event to start the download
link.click();

}

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////fuction to import as excel/////////////////////////////////////////////////////////////////////////////
    async function fetchTextFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
        }
        return response.text();
    }
    
    async function convertJSONtoCSV() {
        try {
            const [parameterData, valueData] = await Promise.all([
                fetchTextFile('/web_parameter.txt'),
                fetchTextFile('/general.txt'),
            ]);
    
            const names = parameterData.split(',');
            const pvalues = valueData.split(',');
    
            // Check if the lengths match
            if (names.length !== pvalues.length) {
                throw new Error('Mismatched data lengths');
            }
    
            // Construct the JSON array
            const data = names.map((name, index) => ({
                "S.NO": index + 1,
                "NAME": name.trim(),
                "VALUE": pvalues[index].trim()
            }));
    
            // Log the resulting JSON array
            console.log(data);
    
            // Convert JSON to CSV content
            const csvContent = jsonToCSV(data);
    
            // Create a Blob from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
            const now = new Date();
    
            // Save the blob as a CSV file
            saveBlob(blob, 'Sonic Data ' + now.toLocaleString() + '.CSV');
        } catch (error) {
            console.error('Error fetching or processing data:', error);
        }
    }
    
    function jsonToCSV(jsonData) {
        const header = Object.keys(jsonData[0]).join(',');
        const rows = jsonData.map(obj => Object.values(obj).join(','));
        return header + '\n' + rows.join('\n');
    }
    
    function saveBlob(blob, fileName) {
        // Create an anchor element
        const a = document.createElement('a');
    
        // Set the href attribute of the anchor element to the Blob URL
        a.href = URL.createObjectURL(blob);
    
        // Set the download attribute to the desired file name
        a.download = fileName;
    
        // Append the anchor element to the document body
        document.body.appendChild(a);
    
        // Programmatically trigger a click event on the anchor element
        a.click();
    
        // Remove the anchor element from the document body
        document.body.removeChild(a);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Fetch data from the server initially
    fetchData();

    // Poll for changes every 10 seconds
    setInterval(fetchData, 10000);

    function fetchData() {
        Promise.all([
            fetch('/web_component.txt').then(response => response.text()),
            fetch('/web_parameter.txt').then(response => response.text()),
            fetch('/general.txt').then(response => response.text()),
        ])
            .then(([compData, parameterData, valueData]) => {
                if (valueData !== state.tables.pvalue) {
                    state.tables.pvalue = valueData;
    
                    // Process data and update state for all components
                    processAndSetData(state, compData, parameterData, valueData);
    
                    // Trigger a custom event indicating that the active component has been updated
                    const activeComponentUpdatedEvent = new Event('activeComponentUpdated');
                    document.dispatchEvent(activeComponentUpdatedEvent);
    
                    // Display details for the active component
                    displayData(state);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }


    function processAndSetData(state, compData, parameterData, valueData) {
        const comp = compData.split(',');
        const parameters = parameterData.split(',');
        const values = valueData.split(',');

        const compMap = {
            "Active Alarms":[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,79,80,81,82,83,84,85,86,92,100,101,102,103,104,145,146,151,152,153,307,309,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,349,350,351,363,364,365,366,367,368,369,370,374,375,376,377,378,379,380,451,452,453,454,455,458,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,528,529,530,531],
            "Controller":[87,88,89,90,91,92,93,94,95,96,97,98,99,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,323,348,349,350,355,356,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,404,406,408,410,412,413,414,415,416,417,418,419,420,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,458,471,472,473,474,475,476,477,478,518,519,520,521,522,523,524,525,526,527,534,535,536,552,553,554,555,556,557,558,559,560,561,562,563],
            "System":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,352,353,354,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,530,531,537,564],   
            "AC Energy Meter":[28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,100,340,402,510],
            "GCU - 1":[27,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,313,314,315,342,347,351,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509],
            "DC Energy Meter":[47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,319,320,341,407,421,422,480,481,482,483,484,485],
            "Solar Energy Meter":[154,191,192,193,321,322,343,403,423],
            "Fuel Sensor":[310,311,312,346,511,512,513,528,529],
            "Inverter":[538,539],
            "Inverter-1":[479,540,541,542,543],
            "Inverter-2":[405,544,545,546,547],
            "Inverter-3":[532,548,549,550,551],
            "GCU - 2":[316,317,318],
            "Aircon - 1":[306,307,344,514,515],
            "Aircon - 2":[308,309,345,516,517],
            "Lithium Battery - 1":[194,195,196,197,198,199,200,324,459],
            "Lithium Battery - 2":[201,202,203,204,205,206,207,325,460],
            "Lithium Battery - 3":[208,209,210,211,212,213,214,326,461],
            "Lithium Battery - 4":[215,216,217,218,219,220,221,327,462],
            "Lithium Battery - 5":[222,223,224,225,228,227,228,328,463],
            "Lithium Battery - 6":[229,230,231,232,233,234,235,329,464],
            "Lithium Battery - 7":[236,237,238,239,240,241,242,330,465],
            "Lithium Battery - 8":[243,244,245,246,247,248,249,331,466],
            "Lithium Battery - 9":[250,251,252,253,254,255,256,332,467],
            "Lithium Battery - 10":[257,258,259,260,261,262,263,333,468],
            "Lithium Battery - 11":[264,265,266,267,268,269,270,334,469],
            "Lithium Battery - 12":[271,272,273,274,275,276,277,335,470],
            "Lithium Battery - 13":[278,279,280,281,282,283,284,336,456],
            "Lithium Battery - 14":[285,286,287,288,289,290,291,337,457],
            "Lithium Battery - 15":[292,293,294,295,296,297,298,338,533],
            "Lithium Battery - 16":[299,300,301,302,303,304,305,339,411],
            "Spare":[409]
        }

        const alarmMap = {
            "Active Alarms":[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,79,80,81,82,83,84,85,86,92,100,101,102,103,104,145,146,151,152,153,307,309,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,349,350,351,363,364,365,366,367,368,369,370,374,375,376,377,378,379,380,451,452,453,454,455,458,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,528,529,530,531],
            "Controller":[92,101,102,103,104,145,146,151,152,153,323,349,350,374,375,376,377,378,379,380,451,452,453,454,455,458],
            "System":[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,363,364,365,366,367,368,369,370,530,531],
            "AC Energy Meter":[100,340],
            "GCU - 1":[79,80,81,82,83,84,85,86,342,351,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508],
            "DC Energy Meter":[341],
            "Solar Energy Meter":[343],
            "Fuel Sensor":[346,528,529],
            "Inverter":[],
            "Inverter-1":[],
            "Inverter-2":[],
            "Inverter-3":[],
            "GCU - 2":[],
            "Aircon - 1":[307.344],
            "Aircon - 2":[309,345],
            "Lithium Battery - 1":[324],
            "Lithium Battery - 2":[325],
            "Lithium Battery - 3":[326],
            "Lithium Battery - 4":[327],
            "Lithium Battery - 5":[328],
            "Lithium Battery - 6":[329],
            "Lithium Battery - 7":[330],
            "Lithium Battery - 8":[331],
            "Lithium Battery - 9":[332],
            "Lithium Battery - 10":[333],
            "Lithium Battery - 11":[334],
            "Lithium Battery - 12":[335],
            "Lithium Battery - 13":[336],
            "Lithium Battery - 14":[337],
            "Lithium Battery - 15":[338],
            "Lithium Battery - 16":[339],
            "Spare":[]
        }

        const result = [];

        // Iterate through components
        comp.forEach(component => {
           // const b = { count: 1 }; // Using an object to keep track of the count
         
            // Check if the trimmed component is in the compMap
            if (compMap[component]) {
                const details = compMap[component].map(index => {
                    return {
                        //'sno' : b.count++,
                        'sno': index, // Incrementing the count
                        pName: parameters[index - 1], // Adjusting for 0-based index
                        value: values[index - 1], // Adjusting for 0-based index
                    };
                });
                const alarmdetails = alarmMap[component].map(index => {
                    return {
                        'sno': index ,
                        pName: parameters[index-1],
                        value: values[index-1],
                    };
                });
                result.push({
                    cName: component,
                    details: details,
                    alarms: alarmdetails,
                    aName : "Active Alarms",
                });
            } else {
                console.error(`Invalid component: ${component}`);
            }
        });

        // Update state
        state.data = result;
        console.log(result)
    }



    function displayData(state) {
        console.log(state)
        const cnameListDiv = document.getElementById('nameList');
        const detailsTableContainer = document.getElementById('tableContainer');
        detailsTableContainer.innerHTML = '';
    
        // Create cname list
        const cnameList = document.createElement('ul');
        state.data.forEach(item => {
            const listItem = document.createElement('li');
            if(item.cName === "Active Alarms"){
                listItem.style.fontWeight = 'BOLD';
            }
            listItem.textContent = item.cName;
            
            listItem.addEventListener('click', () => {
                // Call the displayDetails function with the clicked item
                displayDetails(item);
    
                // Remove the 'active' class from all list items
                state.data.forEach(otherItem => {
                    const otherListItem = document.getElementById(`listItem_${otherItem.cName}`);
                    if (otherListItem) {
                        otherListItem.classList.remove('active');
                    }
                });
    
                // Add the 'active' class to the clicked list item
                listItem.classList.add('active');
            });
            // Set a unique ID for each list item
            listItem.id = `listItem_${item.cName}`;
            cnameList.appendChild(listItem);
        });
        cnameListDiv.innerHTML = '';
        cnameListDiv.appendChild(cnameList);

       if (state.data.length > 0) {
            // Update the active component in the state
            state.activeComponent = state.activeComponent || state.data[0]; // Use existing activeComponent if available, otherwise default to the first component
            displayDetails(state.activeComponent);
        }
        

            var grid = document.getElementById('grid');
            var dg = document.getElementById('dg');
            var battery = document.getElementById('battery');
            var pv = document.getElementById('pv');
            var pvhybridmode = document.getElementById('pvhybridmode'); 

            if(state.data[3].details[17].value  === "1"){
                console.log(state.data[3].details[17].value)
                grid.classList.add('load-flag');
            }
            else {
                grid.classList.add('load-flag1');
            }

            if(state.data[3].details[18].value  === "1"){
                dg.classList.add('load-flag');
            }
            else {
                dg.classList.add('load-flag1');
            }
            
            if(state.data[1].details[6].value  === "1"){
                battery.classList.add('load-flag');
            }
            else {
                battery.classList.add('load-flag1');
            }

            if(state.data[6].details[4].value  === "1"){
                pv.classList.add('load-flag');
            }
            else {
                pv.classList.add('load-flag1');
            }

            if(state.data[6].details[3].value  === "1"){
                pvhybridmode.classList.add('load-flag');
            }
            else {
                pvhybridmode.classList.add('load-flag1');
            }

        }

    function displayDetails(item) {
    // Clear previous details
    const detailsTableContainer = document.getElementById('tableContainer');
    detailsTableContainer.innerHTML = '';
    const heading = document.getElementById('heading');
    heading.textContent= item.cName;

        if (item.cName === "Active Alarms") {

            const detailsWithValueOne = item.details.filter(detail => detail.value === "1");
            const numSections = Math.ceil(detailsWithValueOne.length / 28); // Assuming 28 rows per table
            const itemsPerSection = Math.ceil(detailsWithValueOne.length / numSections);

                if (detailsWithValueOne.length > 0) {
                    // Create tables for each section
                    for (let i = 0; i < numSections; i++) {
                        const startIdx = i * itemsPerSection;
                        const endIdx = startIdx + itemsPerSection;
                        const sectionDetails = detailsWithValueOne.slice(startIdx, endIdx);

                        // Create the table
                        const detailsTable = document.createElement('table');
                        detailsTable.innerHTML = `
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <!--th>Value</th-->
                            </tr>
                        </thead>
                        <tbody id="detailsBody${i}"></tbody>
                        `;
                        detailsTableContainer.appendChild(detailsTable);

                     const detailsBody = document.getElementById(`detailsBody${i}`);

                        // Add new details to the current section's table
                        sectionDetails.forEach((detail, index) => {
                        const row = document.createElement('tr');
                        const colorCode = detail.value === "0" ? 'lightgreen' : detail.value === "1" ? 'lightcoral' : '';
                        row.innerHTML = `
                        <!--td>${startIdx +1}</td -->
                            <td>${detail.sno}</td>
                            <td style="background-color: ${colorCode};">${detail.pName}</td>
                            <!--td style="background-color: ${colorCode};">${detail.value}</td-->
                        `;
                        detailsBody.appendChild(row);
                    
                        });     
                     }
        }
    }

    else {
        const numSections = Math.ceil(item.details.length / 28); // Assuming 28 rows per table
        // Calculate the number of items per section based on the total number of details
        const itemsPerSection = Math.ceil(item.details.length / numSections);


        
        // Create tables for each section
        for (let i = 0; i < numSections; i++) {
            const startIdx = i * itemsPerSection;
            const endIdx = startIdx + itemsPerSection;
            const sectionDetails = item.details.slice(startIdx, endIdx);

            // Create the table
            const detailsTable = document.createElement('table');
            detailsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody id="detailsBody${i}"></tbody>
            `;
            detailsTableContainer.appendChild(detailsTable);

            const detailsBody = document.getElementById(`detailsBody${i}`);

           // Add new details to the current section's table
           sectionDetails.forEach((detail, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <!--td>${startIdx +1}</td -->
                <td>${detail.sno}</td>
                <td>${detail.pName}</td>
                <td>${detail.value}</td>
            `;
            detailsBody.appendChild(row);
            });
        }


        const detailsWithValueOnes = item.alarms.filter(detail => detail.value === "1");
        console.log(detailsWithValueOnes);
        const numSection = Math.ceil(detailsWithValueOnes.length / 28); // Assuming 28 rows per table
        const itemsPerSections = Math.ceil(detailsWithValueOnes.length / numSection);

        if (detailsWithValueOnes.length > 0) {
            // Create tables for each section
            for (let i = 0; i < numSection; i++) {
                const startIdx = i * itemsPerSections;
                const endIdx = startIdx + itemsPerSections;
                console.log(endIdx);
                const sectionDetail = detailsWithValueOnes.slice(startIdx, endIdx);

                // Create the div for each section
                const sectionDiv = document.createElement('div');
            // sectionDiv.style.marginTop = "20px"; // Adjust margin as needed
                detailsTableContainer.appendChild(sectionDiv);

                // Create the table
                const alarmsTable = document.createElement('table');
                alarmsTable.style.marginLeft = "20px";
                alarmsTable.innerHTML = `
                    <thead>
                        <tr>
                            <th colspan="2" style="background-color:white; border-left: 1px solid white; border-right: 1px solid white;">
                                <text style="font-size: 18px; color: black;">${item.aName}</text>
                            </th>
                        </tr>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <!--th>Value</th-->
                        </tr>
                    </thead>
                    <tbody id="alarmsBody${i}"></tbody>
                `;
                sectionDiv.appendChild(alarmsTable);

                const alarmsBody = document.getElementById(`alarmsBody${i}`);

                // Add new details to the current section's table
                sectionDetail.forEach((alarm, index) => {
                    const row = document.createElement('tr');
                    row.style.height = "20px";
                    const colorCode = alarm.value === "0" ? 'lightgreen' : alarm.value === "1" ? 'lightcoral' : '';

                    row.innerHTML = `
                    <!--td>${startIdx +1}</td -->
                        <td>${alarm.sno}</td>
                        <td style="background-color: ${colorCode};">${alarm.pName}</td>
                        <!--td style="background-color: ${colorCode};">${alarm.value}</td-->
                    `;
                    alarmsBody.appendChild(row);
                });
            }
        }
    }
    state.activeComponent = item;
    // Trigger a custom event indicating that the active component has been updated
    const activeComponentUpdatedEvent = new Event('activeComponentUpdated');
    document.dispatchEvent(activeComponentUpdatedEvent); 
    }
   // }
});


document.addEventListener('DOMContentLoaded', function () {

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
});



    // Initialize state
    const state = {
        tables: {},
        data: [],
    };

    // Fetch data from the server initially
    fetchData();

    // Poll for changes every 10 seconds
    setInterval(fetchData, 10000);

    function fetchData() {
        // Read pcomp.txt, parameter.txt, and pvalue.txt using fetch
        Promise.all([
            fetch('/web_component.txt').then(response => response.text()),
            fetch('/web_parameter.txt').then(response => response.text()),
            fetch('/general.txt').then(response => response.text()),
        ])
            .then(([compData, parameterData, valueData]) => {
                // Check if pvalue.txt has changed
                if (valueData !== state.tables.pvalue) {
                    // Update the state only if there's a change
                    state.tables.pvalue = valueData;

                    // Process data and update state
                    processAndSetData(state, compData, parameterData, valueData);

                    // Display data using the updated state
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
            "Active Alarms":[7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,45,46,79,80,81,82,83,84,85,86,92,93,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,128,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,151,152,153,307,309,322,323,324,325,328,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,349,350,351,451,452,453,454,455,456,457,458,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,528,529,530,531],
            "Controller":[87,88,89,90,91,92,93,94,95,96,97,98,99,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,355,356,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,518,519,520,521,522,523,524,525,526,527],
            "System":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,321,322,323,348,349,350,353,354,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,530,531,537],   
            "AC Energy Meter":[28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,100,510],
            "GCU - 1":[27,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,313,314,315,342,347,351,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509],
            "DC Energy Meter":[47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,319,320,341,421,422,479,480,481,482,483,484,485],
            "Solar Energy Meter":[191,192,193,343,423],
            "Fuel Sensor":[310,311,312,346,511,512,513,528,529],
            "Inverter":[538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563],
            "GCU - 2":[316,317,318],
            "Aircon - 1":[306,307,344,514,515],
            "Aircon - 2":[308,309,345,516,517],
            "Lithium Battery - 1":[194,195,196,197,198,199,200,324],
            "Lithium Battery - 2":[201,202,203,204,205,206,207,325],
            "Lithium Battery - 3":[208,209,210,211,212,213,214,326],
            "Lithium Battery - 4":[215,216,217,218,219,220,221,327],
            "Lithium Battery - 5":[222,223,224,225,228,227,228,328],
            "Lithium Battery - 6":[229,230,231,232,233,234,235,329],
            "Lithium Battery - 7":[236,237,238,239,240,241,242.330],
            "Lithium Battery - 8":[243,244,245,246,247,248,249,331],
            "Lithium Battery - 9":[250,251,252,253,254,255,256,332],
            "Lithium Battery - 10":[257,258,259,280,281,282,283,333],
            "Lithium Battery - 11":[284,285,286,287,288,289,270,334],
            "Lithium Battery - 12":[271,272,273,274,275,276,277,335],
            "Lithium Battery - 13":[278,279,280,281,282,283,284,336],
            "Lithium Battery - 14":[285,286,287,288,289,290,291,337],
            "Lithium Battery - 15":[292,293,294,295,296,297,298,338],
            "Lithium Battery - 16":[299,300,301,302,303,304,305,339],
            "Spare":[532,533,534,535,536]
        }

        const alarmMap = {
            "Active Alarms":[7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,45,46,79,80,81,82,83,84,85,86,92,93,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,128,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,151,152,153,307,309,322,323,324,325,328,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,349,350,351,451,452,453,454,455,456,457,458,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,528,529,530,531],
            "Controller":[92,93,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,128,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,151,152,153,451,452,453,454,455,456,457,458],
            "System":[7,8,9,11,12,13,14,15,16,17,18,19,20,21,22,23,322,323,349,350,530,531],
            "AC Energy Meter":[45,46,100,340],
            "GCU - 1":[79,80,81,82,83,84,85,86,342,351,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508],
            "DC Energy Meter":[341],
            "Solar Energy Meter":[343],
            "Fuel Sensor":[346,528,529],
            "Inverter":[],
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
        const cnameListDiv = document.getElementById('nameList');
        const detailsTableContainer = document.getElementById('tableContainer');
    
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

        // Display details for the first item by default
        if (state.data.length > 0) {
            displayDetails(state.data[2]);
        }



    function displayDetails(item) {
    // Clear previous details
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
                        <td>${alarm.sno}</td>
                        <td style="background-color: ${colorCode};">${alarm.pName}</td>
                        <!--td style="background-color: ${colorCode};">${alarm.value}</td-->
                    `;
                    alarmsBody.appendChild(row);
                });
            }
        }
    }
    }
    }
});

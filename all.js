const data = [];
const selectList = document.querySelector('.selectList');
const popSearch = document.querySelector('.popSearch');
const pageDiv = document.querySelector('.pagination');
const areaName = document.querySelector('.areaName');
const gotop = document.querySelector('.gotop')
const ForRender = document.querySelector('.ForRender');

let currentPage = 1;
let nowData =[];

axios.get('https://api.kcg.gov.tw/api/service/Get/9c8e1450-e833-499c-8320-29b36b7ace5c')
    .then(function (response) {

        const apiData = response.data.data.XML_Head.Infos.Info;
        let DistArray = [];

        apiData.forEach(function(item){
            let obj = {};
            obj.Name = item.Name;
            obj.Description = item.Description;// for title 用
            obj.Tel = (item.Tel).replace('886-','0');//將電話資料內的'886-'置換為'0'
            obj.Add = item.Add;//地址
            obj.Dist = item.Add.substr(6,3);
                if(obj.Dist === "那瑪夏"){
                    obj.Dist = "那瑪夏區"
                };//高雄市內唯一的4字元行政區
            obj.Opentime = item.Opentime;
            obj.Picture = item.Picture1;
            obj.PictureAlt = item.Picdescribe1;
            if(item.Ticketinfo == "" || item.Ticketinfo == "免費" || item.Ticketinfo == "免費入園"){
                obj.Ticketinfo = "免費參觀"
            } else {
                obj.Ticketinfo = ""
            }///門票資訊篩選
            
            data.push(obj) //寫入本機端
            nowData = data;
            DistArray.push(obj.Dist);//
        });

        //用api資料做選單內容
        const set = new Set(DistArray); //過濾陣列重複元素，各元素只取一次
        DistArray = [...set];//將物件展開成陣列
        //也可以這樣寫
        // DistArray = [...new Set(DistArray)]

        //製作選單
        DistArray.forEach(function(item){
            let opt = document.createElement('option');
            opt.textContent = item;
            opt.setAttribute('value',item)
            selectList.appendChild(opt)
        })
        pagenation(data);
        areaName.textContent = "高雄市"
    });

function pagenation(data){
    const dataTotal = data.length;
    const dataPerPage = 10 ;//每頁的資料筆數
    const showPages = 5;//在pagenation裡要顯示幾頁
    const pageTotal = Math.ceil(dataTotal/dataPerPage);
    let minPage;
    let maxPage;

    if (currentPage>pageTotal){
        currentPage = pageTotal;
    }//避免當前頁數筆總頁數還要多

    //先判斷pagenation顯示的最小及最大頁數
    if (pageTotal >= showPages){
        if(currentPage<=3){
            minPage = 1;
            maxPage = showPages;
        } else if (currentPage > 3){
            if((currentPage+2)<pageTotal){
                minPage = currentPage - 2;
                maxPage = currentPage + 2;
            }else {
                minPage = pageTotal - 4;
                maxPage = pageTotal ;
            }
        }
    }else if (pageTotal<showPages){
        minPage = 1;
        maxPage = pageTotal;
    }
 // 用物件方式來傳遞資料
    const dataDisplay = {
        dataPerPage,
        pageTotal,
    }
    dataRender(dataDisplay);

    const page = {
        minPage,
        maxPage,
        hasPage: currentPage > 1,
        hasNext: currentPage < pageTotal,
    }
    pagePrint(page)
}

selectList.addEventListener('change',nowDataFilter);

popSearch.addEventListener('click',function(e){
    if(e.target.nodeName === 'BUTTON'){
        nowDataFilter(e);
        selectList.value = e.target.value;
    }
})

function nowDataFilter(e){
    nowData = [];
    currentPage = 1;
    data.forEach(function(item){
        if(item.Dist === e.target.value){
            nowData.push(item);
            areaName.textContent = e.target.value;

        }else if(e.target.value ==="all"){
            nowData = data;
        areaName.textContent = "高雄市";

        }
    })
    pagenation(nowData);
}
// 印出頁碼
function pagePrint(page){
    let str = '';
    if (page.hasPage){
        str += `<li class="page-item"><a class="page-link" href="#" aria-label="Previous">&laquo;</a></li>`
    }else {
        str += `<li class="page-item disabled"><a class="page-link" href="#" aria-label="Previous">&laquo;</a></li>`
    }

    for(let i= page.minPage; i <= page.maxPage;i++){
        if (currentPage === i){
            str += `<li class="page-item active" aria-current="page"><a class="page-link" href="#">${i}</a></li>`
        }else{
            str += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
        }
    }

    if(page.hasNext){
        str +=`<li class="page-item"><a class="page-link" href="#" aria-label="Next">&raquo;</a></li>`
    }else {
        str +=`<li class="page-item  disabled"><a class="page-link" href="#" aria-label="Next">&raquo;</a></li>`
    }

    pageDiv.innerHTML = str;

}

pageDiv.addEventListener('click',changePage);

function changePage(e){
    e.preventDefault()
    if (e.target.nodeName !=="A"){
        return
    }
    if (e.target.textContent === "»"){
        currentPage++;
    }else if (e.target.textContent === "«"){
        currentPage--;
    }else {
        currentPage = Number(e.target.textContent);
    }    
pagenation(nowData);
}

function dataRender(e){
    const min = (currentPage*e.dataPerPage)- e.dataPerPage +1;
    const max = currentPage*e.dataPerPage;
    let str ='';
    for (let i = min-1 ; i< max;i++){
        if(!nowData[i]){break}//如果沒有資料，跳出迴圈
        str += `<div class="col">
        <div class="card h-100 shadow" title="${nowData[i].Description}">
            <div class="photo position-relative">
                <img src="${nowData[i].Picture}" class="card-img-top" alt="${nowData[i].PictureAlt}">
                <h5 class="card-Name card-title text-white position-absolute bottom-0 start-0 p-2" >${nowData[i].Name}</h5>
                <p class="card-title text-white position-absolute bottom-0 end-0 p-2" >${nowData[i].Dist}</p>
            </div>
            <div class="card-body position-relative">
                <p class="card-text list-inline-item"><i class="fas fa-clock me-2"></i>${nowData[i].Opentime}</p><br>
                <p class="card-text list-inline-item"><a  target="_blank" href="https://www.google.com.tw/maps/search/${nowData[i].Add}"><i class="fas fa-map-marker-alt me-2"></i>${nowData[i].Add}</a></p><br>
                <p class="card-text list-inline-item mb-0"><i class="fas fa-mobile-alt me-2"></i>${nowData[i].Tel}</p>
                <div class="position-absolute bottom-0 end-0 mb-3 me-2">
                    <p class="card-text list-inline-item  px-2"><i class="fas fa-tags me-2"></i>${nowData[i].Ticketinfo}</p>
                </div>
            </div>
        </div>
    </div>`
    }

ForRender.innerHTML = str;
}

gotop.addEventListener('click',function(e){
    e.preventDefault();
    scroll(0,0)
})

window.onscroll = function(){gotopShow()};

function gotopShow() {
    if (document.body.scrollTop > 450 || document.documentElement.scrollTop > 450) {
        gotop.classList.remove('d-none','fadeOut');
        gotop.classList.add('fadeIn');
    } else {
        gotop.classList.add('fadeOut');
        gotop.classList.remove('fadeIn');
    }
    if (document.body.scrollTop == 0 && document.documentElement.scrollTop == 0){
        setTimeout(function(){gotop.classList.add('d-none')},250);
    }
}
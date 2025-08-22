// ===== Lớp Mobile =====
class Mobile{
    constructor(name, pin=100){
        this.name = name;
        this.pin = Math.max(0, Math.min(100, parseInt(pin,10) || 0)); // 0..100
        this.on = false;         // bật/tắt
        this.draft = "";         // tin đang soạn
        this.inbox = [];         // tin đến
        this.sent  = [];         // tin đã gửi
    }
    _drain(){                  // trừ pin 1
        if(this.pin>0) this.pin--;
        if(this.pin===0) this.on=false; // hết pin tự tắt
    }
    check(){
        if(!this.on){ this._drain(); return `Tắt | pin ${this.pin}`; }
        this._drain(); return `Bật | pin ${this.pin}`;
    }
    powerOn(){ if(this.pin>0) this.on = true; this._drain(); }
    powerOff(){ this.on = false; this._drain(); }
    charge(n=10){ this.pin = Math.min(100, this.pin + n); this._drain(); }
    type(text){
        if(!this.on) return "Máy đang tắt";
        this.draft = String(text||"");
        this._drain();
        return "Đã soạn";
    }
    send(to){
        if(!this.on) return "Máy đang tắt";
        if(!this.draft) return "Chưa có nội dung";
        to.receive(this, this.draft);
        this.sent.push({to: to.name, msg: this.draft, time: new Date().toLocaleTimeString()});
        this.draft = "";
        this._drain();
        return "Đã gửi";
    }
    receive(from, msg){
        if(!this.on) return; // máy tắt: không nhận
        this.inbox.push({from: from.name, msg, time: new Date().toLocaleTimeString()});
        this._drain();
    }
    getInbox(){ if(!this.on) return []; this._drain(); return this.inbox.slice(); }
    getSent(){  if(!this.on) return []; this._drain(); return this.sent.slice();  }
}

// ===== DOM helper =====
const $ = id => document.getElementById(id);
function renderList(list){
    if(!list.length) return "Không có tin.";
    return list.map((m,i)=>`${i+1}. ${m.time} - ${m.from?('From '+m.from):('To '+m.to)}: ${m.msg}`).join("\n");
}
function showStatus(nokia, iphone){
    $("nokiaStatus").textContent  = `| ${nokia.on?'Bật':'Tắt'} | pin ${nokia.pin}`;
    $("iphoneStatus").textContent = `| ${iphone.on?'Bật':'Tắt'} | pin ${iphone.pin}`;
}

// ===== Khởi tạo sau khi DOM sẵn sàng (defer đảm bảo DOM đã tải) =====
const nokia  = new Mobile("Nokia", 100);
const iphone = new Mobile("iPhone", 100);

// NOKIA events
$("nokiaOn").onclick     = ()=>{ nokia.powerOn(); showStatus(nokia, iphone); };
$("nokiaOff").onclick    = ()=>{ nokia.powerOff(); showStatus(nokia, iphone); };
$("nokiaCharge").onclick = ()=>{ nokia.charge(10); showStatus(nokia, iphone); };
$("nokiaCheck").onclick  = ()=>{ $("nokiaView").textContent = nokia.check(); showStatus(nokia, iphone); };
$("nokiaSend").onclick   = ()=>{
    const txt = $("nokiaDraft").value;
    $("nokiaView").textContent = nokia.type(txt) + " | " + nokia.send(iphone);
    $("nokiaDraft").value = "";
    showStatus(nokia, iphone);
};
$("nokiaInboxBtn").onclick = ()=>{
    $("nokiaView").textContent = renderList(nokia.getInbox());
    showStatus(nokia, iphone);
};
$("nokiaSentBtn").onclick = ()=>{
    $("nokiaView").textContent = renderList(nokia.getSent());
    showStatus(nokia, iphone);
};

// IPHONE events
$("iphoneOn").onclick     = ()=>{ iphone.powerOn(); showStatus(nokia, iphone); };
$("iphoneOff").onclick    = ()=>{ iphone.powerOff(); showStatus(nokia, iphone); };
$("iphoneCharge").onclick = ()=>{ iphone.charge(10); showStatus(nokia, iphone); };
$("iphoneCheck").onclick  = ()=>{ $("iphoneView").textContent = iphone.check(); showStatus(nokia, iphone); };
$("iphoneSend").onclick   = ()=>{
    const txt = $("iphoneDraft").value;
    $("iphoneView").textContent = iphone.type(txt) + " | " + iphone.send(nokia);
    $("iphoneDraft").value = "";
    showStatus(nokia, iphone);
};
$("iphoneInboxBtn").onclick = ()=>{
    $("iphoneView").textContent = renderList(iphone.getInbox());
    showStatus(nokia, iphone);
};
$("iphoneSentBtn").onclick = ()=>{
    $("iphoneView").textContent = renderList(iphone.getSent());
    showStatus(nokia, iphone);
};

// ===== Kịch bản mẫu theo đề =====
nokia.powerOn();
iphone.powerOn();
nokia.type("Chào iPhone, bạn khỏe không?");
nokia.send(iphone);
$("iphoneView").textContent = renderList(iphone.getInbox());
showStatus(nokia, iphone);

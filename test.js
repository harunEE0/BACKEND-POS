function u() {
 this.count = 0 ;
};
u.increment = function() {
    this.count++
};
const m = new u();
u.r();
console.log(m.count);
console.log(u.count);
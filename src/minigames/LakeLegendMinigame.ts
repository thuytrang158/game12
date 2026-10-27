import { LEGEND_PANELS, isExactOrder } from '../data/lake';

/** A real ordering puzzle. The host owns discovery prerequisites and rewards. */
export class LakeLegendMinigame {
  private order = ['river', 'meeting', 'separation'];
  private finished = false;
  constructor(private containerEl: HTMLElement, private onComplete?: () => void) {}
  start() { this.finished = false; this.order=['river','meeting','separation'];this.render(); }
  private render(message = '') {
    this.containerEl.innerHTML=`<section class="lake-order-puzzle"><h3>Ghép huyền tích nàng Công – chàng Cốc</h3><p>Sắp ba tranh theo diễn biến. Dùng nút lên / xuống, không cần kéo thả.</p><div class="lake-order-list"></div><p class="lake-feedback" role="status" aria-live="polite">${message}</p><button class="lake-btn" id="btn-complete-legend">Xác nhận thứ tự câu chuyện</button></section>`;
    const list=this.containerEl.querySelector('.lake-order-list')!;
    this.order.forEach((id,index)=>{
      const panel=LEGEND_PANELS.find(p=>p.id===id)!;const card=document.createElement('article');card.className='lake-order-card';card.dataset.story=id;
      card.innerHTML=`<span class="lake-order-number">${index+1}</span><div><h4>${panel.title}</h4><p>${panel.text}</p></div><div class="lake-order-controls"><button aria-label="Đưa ${panel.title} lên">↑</button><button aria-label="Đưa ${panel.title} xuống">↓</button></div>`;
      const [up,down]=card.querySelectorAll('button');up.disabled=index===0;down.disabled=index===2;
      const move=(direction:number)=>{const j=index+direction;if(j<0||j>=this.order.length)return;[this.order[index],this.order[j]]=[this.order[j],this.order[index]];this.render();this.containerEl.querySelector<HTMLElement>(`[data-story="${id}"] button:not(:disabled)`)?.focus();};
      up.onclick=()=>move(-1);down.onclick=()=>move(1);list.append(card);
    });
    this.containerEl.querySelector<HTMLButtonElement>('#btn-complete-legend')!.onclick=()=>{
      if(this.finished)return;
      if(!isExactOrder(this.order,LEGEND_PANELS.map(panel=>panel.id))){this.render('Chưa đúng. Hãy bắt đầu bằng cuộc gặp, tiếp đến sự chia cách, rồi hình ảnh núi và sông.');return;}
      this.finished=true;const button=this.containerEl.querySelector<HTMLButtonElement>('#btn-complete-legend')!;button.disabled=true;
      this.containerEl.querySelector('.lake-feedback')!.textContent='✓ Ba tranh đã đúng thứ tự.';this.onComplete?.();
    };
  }
}

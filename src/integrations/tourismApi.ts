import { IDestination, ITourRecommendation } from '../types/game';
import { DESTINATIONS } from '../data/destinations';

export interface ITourismEventPayload {
  action: 'view_destination' | 'view_tour' | 'book_tour' | 'sync_progress' | 'claim_reward';
  destinationId?: string;
  tourId?: string;
  payload?: any;
}

export class TourismApiAdapter {
  private static instance: TourismApiAdapter;
  private websiteBaseUrl: string = 'https://thainguyen.tourism.gov.vn';

  public static getInstance(): TourismApiAdapter {
    if (!TourismApiAdapter.instance) {
      TourismApiAdapter.instance = new TourismApiAdapter();
    }
    return TourismApiAdapter.instance;
  }

  /**
   * Dispatches events to parent website via DOM CustomEvent and postMessage
   */
  public dispatchAction(data: ITourismEventPayload) {
    // 1. Dispatch custom DOM event for same-page hosting
    const event = new CustomEvent('thai_nguyen_quest_event', {
      detail: data,
      bubbles: true
    });
    window.dispatchEvent(event);

    // 2. Post message for iframe embedding in booking portals
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'THAI_NGUYEN_QUEST_EVENT', ...data }, '*');
    }

    console.info('[TourismApiAdapter] Dispatched action:', data);
  }

  /**
   * Retrieves full destination metadata
   */
  public getDestination(destId: string): IDestination | undefined {
    return DESTINATIONS[destId];
  }

  /**
   * Retrieves recommended tours for a destination
   */
  public getToursForDestination(destId: string): ITourRecommendation[] {
    const dest = this.getDestination(destId);
    return dest ? dest.realWorldInfo.suggestedTours : [];
  }

  /**
   * Handles user clicking to explore more or book a tour
   */
  public onExploreDestination(destId: string) {
    this.dispatchAction({
      action: 'view_destination',
      destinationId: destId
    });

  }

  /**
   * Handles tour booking action
   */
  public onBookTour(tour: ITourRecommendation, destId: string) {
    this.dispatchAction({
      action: 'book_tour',
      destinationId: destId,
      tourId: tour.id,
      payload: tour
    });

  }
}

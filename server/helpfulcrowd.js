/**
 * Helper to fetch live review slider HTML/data directly from HelpfulCrowd server
 */
export async function handleHelpfulCrowdApi(req, res) {
  const STORE_HASH = 'Q0SJgz7';
  
  if (req.method === 'GET' && req.path === '/reviews') {
    try {
      const hcUrl = `https://app.helpfulcrowd.com/f/${STORE_HASH}/w/review_slider`;
      const response = await fetch(hcUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        res.status(response.status).json({ error: 'Failed to fetch from HelpfulCrowd' });
        return true;
      }

      const html = await response.text();
      
      // Parse reviews dynamically from live HelpfulCrowd HTML
      const reviews = [];
      const cardRegex = /<li class="hc-card__item">([\s\S]*?)<\/li>/g;
      let match;

      while ((match = cardRegex.exec(html)) !== null) {
        const cardHtml = match[1];

        // 1. Rating
        const starMatches = cardHtml.match(/class="hc-icon\s+hc-icon--star/g);
        const rating = starMatches ? starMatches.length : 5;

        // 2. Date
        const dateMatch = cardHtml.match(/<time[^>]*>([^<]+)<\/time>/);
        const date = dateMatch ? dateMatch[1].trim() : '';

        // 3. Product info
        const prodThumbMatch = cardHtml.match(/<div class="hc-product-card__thumb"><img[^>]+src="([^">]+)"/);
        const prodNameMatch = cardHtml.match(/<div class="hc-product-card__name">([^<]+)<\/div>/);
        const prodLinkMatch = cardHtml.match(/<a class="hc-product-card" href="([^">]+)"/);

        // 4. Review text
        const feedbackMatch = cardHtml.match(/<p class="hc-review__feedback">([\s\S]*?)<\/p>/);
        const feedback = feedbackMatch ? feedbackMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        // 5. Author
        const authorMatch = cardHtml.match(/<div class="hc-author__text">[\s\S]*?<span class="bold">([^<]+)<\/span>/);
        const author = authorMatch ? authorMatch[1].trim() : 'Customer';
        const initialMatch = cardHtml.match(/<div class="hc-avatar hc-avatar__initials"[^>]*>([^<]+)<\/div>/);
        const authorInitial = initialMatch ? initialMatch[1].trim() : author.charAt(0);

        reviews.push({
          id: `hc-rev-${reviews.length + 1}`,
          rating,
          date,
          productName: prodNameMatch ? prodNameMatch[1].trim() : '',
          productImage: prodThumbMatch ? prodThumbMatch[1] : '',
          productUrl: prodLinkMatch ? prodLinkMatch[1] : '',
          reviewBody: feedback,
          reviewTitle: feedback,
          author,
          authorInitial
        });
      }

      res.status(200).json({
        storeHash: STORE_HASH,
        total: reviews.length,
        items: reviews,
        rawHtml: html
      });
      return true;
    } catch (err) {
      console.error('HelpfulCrowd proxy error:', err);
      res.status(500).json({ error: err.message });
      return true;
    }
  }

  return false;
}

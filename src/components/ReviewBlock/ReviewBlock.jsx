import React from 'react';
import HelpfulCrowdWidget from '../../integrations/helpfulcrowd/HelpfulCrowdWidget';
import styles from './ReviewBlock.module.css';

const ReviewBlock = ({ productId }) => {
  return (
    <section className={styles.reviewBlockSection} id="write-review">
      <div className={styles.reviewBlockContainer}>
        <h2 className={styles.reviewBlockTitle}>Customer Reviews & Q&A</h2>
        <HelpfulCrowdWidget key={`tabs-${productId}`} widgetType="product-tabs" productId={productId} />
      </div>
    </section>
  );
};

export default ReviewBlock;

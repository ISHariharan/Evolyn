import { useState, useEffect } from "react";
import "./FeatureCard.scss";
import { FeatureCardType } from "./type";

const FeatureCard = ({Title, Tag, Description, key_importance} : FeatureCardType) => {
  return (
    <div className="card">
        <div className="card-header">
          <span className="title">{Title}</span>
          <span className="price">{Tag}</span>
        </div>
        <p className="desc">{Description}</p>
        <ul className="lists">
          {key_importance.map((item, index) => (
            <li className="list" key={index}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="tick-symbol">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="action">Get Started</button>
    </div>
  );
};

export default FeatureCard;

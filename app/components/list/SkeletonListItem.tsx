"use client";

import React from 'react';
import './ListItem.css';

export function SkeletonListItem() {
    return (
        <div className="list-item skeleton" aria-hidden="true">
            <div className="checkbox">
                <div className="box" />
                <span className="skeleton-label">Loading items…</span>
            </div>
        </div>
    );
}

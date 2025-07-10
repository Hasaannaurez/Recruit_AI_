def get_final_score(score_details, o_aspects, g_aspects):
    final_scores = {"score_details": {}}

    # Calculate overall score
    # o_params = o_aspects.get("overall score", [])
    o_params = o_aspects
    total_weight = 0
    weighted_sum = 0

    for param in o_params:
        par = param["par"]
        w = float(param["w"])
        p = float(param["p"])
        c = param["c"]
        score = float(score_details.get(par))

        if score is not None:
            weighted_sum += score * w
        else:
            # Penalty if evidence is missing
            weighted_sum += (- p) * w
        total_weight += w

    weighted_sum = 0 if weighted_sum < 0 else weighted_sum
    o_score = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0
    final_scores["score_details"]["o_score"] = o_score

    # Calculate group scores
    for aspect, params in g_aspects.items():
        total_weight = 0
        weighted_sum = 0

        for param in params:
            par = param["par"]
            w = float(param["w"])
            score = float(score_details.get(par))

            if score is not None:
                weighted_sum += score * w
            total_weight += w  # Even if score is None, still include the weight

        aspect_score = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0
        final_scores["score_details"][aspect] = aspect_score

    return final_scores

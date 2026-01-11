import { NextFunction, Request, Response } from 'express';
import { searchQueryService } from '../services/concrete/searchQueryService';
import { HTTP_STATUS_CODE, SEARCH_QUERY_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { TSearchQueryListPaginationRes, TSearchQueryListRes, TSearchQueryRes, TTrendingSearchRes, TSearchSuggestionsRes } from '../types/searchQuery';

export class SearchQueryController {
  private get searchQueryService() { return searchQueryService; }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.searchQueryService.generateFilter({ filters: { ...req.query, ...req.body } });
      const response = await this.searchQueryService.findAll(filter);

      const apiResponse: TSearchQueryListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.searchQueryService.generateFilter({ filters: req.body });
      const response = await this.searchQueryService.findOne(filter);

      const apiResponse: TSearchQueryRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response || undefined,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: any = { ...req.query, ...req.body };
      const { filter, options } = this.searchQueryService.generateFilter({ filters: reqData });
      const response = await this.searchQueryService.findAllWithPagination(filter, options);

      const apiResponse: TSearchQueryListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.searchQueryService.create(req.body, { userId: req.user?._id });

      const apiResponse: TSearchQueryRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.searchQueryService.updateOne({ _id: req.params.id } as any, req.body, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.GET_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.searchQueryService.generateFilter({ filters: req.body });
      await this.searchQueryService.softDelete(filter, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.GET_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getTrending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const trending = await this.searchQueryService.getTrending(limit);

      const apiResponse: TTrendingSearchRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.TRENDING_SUCCESS,
        data: trending,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.query || req.query.q) as string || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const suggestions = await this.searchQueryService.getSuggestions(query, limit);

      const apiResponse: TSearchSuggestionsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.SUGGESTIONS_SUCCESS,
        data: suggestions,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  trackSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, resultCount } = req.body;
      const userId = req.user?._id;

      await this.searchQueryService.create({ query, resultCount, userId }, { userId });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: SEARCH_QUERY_SUCCESS_MESSAGES.CREATE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const searchQueryController = new SearchQueryController();
